from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description='Quita fondo a una imagen usando rembg.')
    parser.add_argument('input', type=Path, help='Ruta de la imagen de entrada')
    parser.add_argument('output', type=Path, help='Ruta de la imagen de salida')
    args = parser.parse_args()

    try:
        from rembg import remove
        from PIL import Image
    except ModuleNotFoundError as exc:
        raise SystemExit(
            'Falta la dependencia rembg. Instálala con: pip install rembg pillow'
        ) from exc

    input_path = args.input
    output_path = args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(input_path) as img:
        result = remove(img)
        result.save(output_path)

    print(f'Imagen procesada: {output_path}')


if __name__ == '__main__':
    main()
