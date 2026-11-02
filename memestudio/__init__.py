"""Meme Studio Pro — backend hexagonal.

Estructura (arquitectura hexagonal / ports & adapters):

- domain/      Reglas de negocio PURAS (sin FastAPI, sin I/O): validacion de
               credenciales, hashing scrypt, matching difuso de memes,
               recorte del sujeto tras quitar el fondo.
- ports/       Interfaces del dominio con el exterior (UserRepository,
               SessionStore, DraftStore, BackgroundMasker, MemeCatalog...).
               El dominio nunca conoce implementaciones concretas.
- adapters/    Implementaciones concretas de los puertos: SQLite, archivos
               (drafts/), rembg/U2-Net, Imgflip, Arctic Shift (Reddit).
- app/         Capa de entrega FastAPI: routers y middleware. Traduce
               HTTP <-> llamadas al dominio/ports, nada de logica de negocio.

server.py es solo el punto de entrada (settings + create_app + uvicorn).
"""

__version__ = "1.0.0"
