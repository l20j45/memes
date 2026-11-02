#!/usr/bin/env python3
"""Automatizacion del versionado de front (cache-busting) para Meme Studio Pro.

Que hace al momento de un commit (via hook post-commit, en background):
  1. Mira que archivos cambio el commit.
  2. Si toco public/app.mjs o public/web/*.js -> sube app.mjs?v=N+1 en
     public/memegnerator.html.
  3. Si toco public/styles.css -> sube styles.css?v=N+1.
  4. Si toco public/sw.js -> sube el nombre del cache (memestudio-vN+1).
  5. Si toco CUALQUIER cosa de public/ -> re-sincroniza los assets del
     Android (android/app/src/main/assets) y commita esos cambios como
     chore(release): ... [skip-bump] (el marcador evita bucles).

Uso:
  python3 tools/bump_version.py --install    # instala la seccion del hook (idempotente)
  python3 tools/bump_version.py [--dry-run]  # procesa el HEAD actual
"""

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

MARKER = "[skip-bump]"
HOOK_START = "# --- BUMP VERSION (tools/bump_version.py) ---"
HOOK_END = "# --- bump-version-end ---"
HTML = "public/memegnerator.html"
ANDROID_ASSETS = Path("android/app/src/main/assets")
CACHE_PREFIX = "memestudio-v"

HOOK_SECTION = f'''{HOOK_START}
# Versionado automatico del front: sube ?v=N de lo tocado en public/,
# re-sincroniza los assets del APK y commita como chore(release).
# Ignora sus propios commits por el marcador {MARKER}.
(
    _top=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
    cd "$_top" || exit 0
    [ -f tools/bump_version.py ] || exit 0
    python3 tools/bump_version.py >/dev/null 2>&1 &
) >/dev/null 2>&1 &
{HOOK_END}'''


def run(cmd, cwd):
    """subprocess.run que devuelve stdout o None; nunca lanza."""
    try:
        out = subprocess.run(
            cmd, cwd=cwd, capture_output=True, text=True, timeout=60
        )
        return out.stdout if out.returncode == 0 else None
    except (OSError, subprocess.SubprocessError):
        return None


def repo_root():
    here = Path(__file__).resolve().parent
    top = run(["git", "rev-parse", "--show-toplevel"], cwd=here)
    return Path(top.strip()) if top else None


def head_message(top):
    msg = run(["git", "log", "-1", "--pretty=%B"], cwd=top)
    return (msg or "").strip()


def head_changed_files(top):
    files = run(["git", "show", "--pretty=format:", "--name-only", "HEAD"], cwd=top)
    if files is None:
        return []
    return [line.strip() for line in files.splitlines() if line.strip()]


def bump_html_asset(html, fname):
    """Sube ?v=N+1 de un asset referenciado en el HTML canonico."""
    pattern = re.compile(re.escape(fname) + r"\?v=(\d+)")
    if not pattern.search(html):
        return html, False
    new = pattern.sub(lambda m: f"{fname}?v={int(m.group(1)) + 1}", html)
    return new, new != html


def bump_sw_cache(js):
    """Sube memestudio-vN del nombre del cache del Service Worker."""
    pattern = re.compile(rf"(const CACHE = '{CACHE_PREFIX})(\d+)")
    if not pattern.search(js):
        return js, False
    new = pattern.sub(lambda m: f"{m.group(1)}{int(m.group(2)) + 1}", js)
    return new, new != js


def sync_android(top):
    src = top / "public"
    dst = top / ANDROID_ASSETS
    if not src.is_dir():
        return False
    if dst.exists():
        shutil.rmtree(dst)
    dst.mkdir(parents=True, exist_ok=True)
    shutil.copytree(src, dst, dirs_exist_ok=True)
    return True


def process_head(dry_run=False, verbose=False):
    top = repo_root()
    if not top or not (top / ".git").exists():
        return "no es un repo git; nada que hacer"

    message = head_message(top)
    if MARKER in message:
        return "commit propio del bump; omitido"

    changed = head_changed_files(top)
    if not changed:
        return "sin archivos en el HEAD; nada que hacer"

    public_changed = {f for f in changed if f == "public/" or f.startswith("public/")}
    if not public_changed:
        return "el commit no toco public/; nada que hacer"

    names = {str(Path(f).relative_to(Path("public"))) for f in public_changed if f != "public/"}
    html_path = top / HTML
    if not html_path.exists():
        return f"falta {HTML}; nada que hacer"

    html = html_path.read_text(encoding="utf-8")
    notes = []
    dirty = False

    if "app.mjs" in names or any(n.startswith("web/") for n in names):
        html, ok = bump_html_asset(html, "app.mjs")
        dirty |= ok
        notes.append("app.mjs" if ok else "app.mjs (sin ?v)")
    if "styles.css" in names:
        html, ok = bump_html_asset(html, "styles.css")
        dirty |= ok
        notes.append("styles.css" if ok else "styles.css (sin ?v)")

    if dirty:
        html_path.write_text(html, encoding="utf-8")
        notes.append(f"{HTML} actualizado")

    if "sw.js" in names:
        sw_path = top / "public/sw.js"
        if sw_path.exists():
            js, ok = bump_sw_cache(sw_path.read_text(encoding="utf-8"))
            if ok:
                sw_path.write_text(js, encoding="utf-8")
                notes.append("cache del SW subido")
            dirty |= ok

    # cualquier cambio de public/ re-sincroniza los assets del APK
    sync_android(top)
    notes.append("assets Android re-sincronizados")
    dirty = True

    if verbose or dry_run:
        print(f"cambios detectados de public/: {sorted(names)}")
        print(f"acciones: {notes}")

    if not dirty:
        return "nada que versionar"

    if dry_run:
        return "DRY-RUN: cambios listos, no escritos"

    git_changed = run(["git", "status", "--porcelain"], cwd=top) or ""
    if not git_changed.strip():
        return "git no ve cambios despues del bump; sin commit"

    run(["git", "add", "-A"], cwd=top)
    out = run(
        ["git", "commit", "-m",
         f"chore(release): bump de versiones y assets Android {MARKER}"],
        cwd=top,
    )
    if out is None:
        return "commit del bump fallo (con archivos ya preparados para el proximo)"
    return f"commit de bump creado ({', '.join(notes) if notes else 'assets'})"


def install_hook():
    top = repo_root()
    if not top:
        return "no es un repo git"
    hook = top / ".git" / "hooks" / "post-commit"
    hook.parent.mkdir(parents=True, exist_ok=True)
    current = hook.read_text(encoding="utf-8") if hook.exists() else "#!/bin/sh\n"
    if HOOK_START in current:
        return "la seccion del hook ya existe; nada que hacer"
    with hook.open("a", encoding="utf-8") as fh:
        if not current.endswith("\n"):
            fh.write("\n")
        fh.write("\n" + HOOK_SECTION + "\n")
    try:
        hook.chmod(0o755)
    except OSError:
        subprocess.run(["chmod", "+x", str(hook)], timeout=10)
    return f"seccion instalada en {hook} (idempotente: se puede re-ejecutar)"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--install", action="store_true", help="instala la seccion del hook post-commit")
    parser.add_argument("--dry-run", action="store_true", help="simula sin escribir ni commitar")
    parser.add_argument("--verbose", action="store_true", default=True)
    args = parser.parse_args()

    result = install_hook() if args.install else process_head(dry_run=args.dry_run, verbose=args.verbose)
    print(result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
