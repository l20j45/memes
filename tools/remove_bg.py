from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description='Quita fondo a una imagen usando rembg.')
    parser.add_argument('input', type=Path, help='Ruta de la imagen de entrada')
    parser.add_argument('output', type=Path, help='Ruta de la imagen de salida')
    args = parser.parse_args()

    input_path = args.input
    output_path = args.output

    if not input_path.is_file():
        raise SystemExit(f'El archivo de entrada no existe: {input_path}')

    try:
        from rembg import remove
        from PIL import Image
    except (ModuleNotFoundError, RuntimeError) as exc:
        raise SystemExit(
            'Falta la dependencia rembg o su backend ONNX. Instálala con: pip install "rembg[cpu]" pillow'
        ) from exc

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(input_path) as img:
        result = remove(img)
        if output_path.suffix.lower() in ('.jpg', '.jpeg'):
            # JPEG no admite canal alfa (transparencia)
            rgb = Image.new('RGB', result.size, (255, 255, 255))
            rgb.paste(result, mask=result.split()[3])
            rgb.save(output_path, quality=95)
        else:
            result.save(output_path)

    print(f'Imagen procesada con éxito: {output_path}')


if __name__ == '__main__':
    main()
