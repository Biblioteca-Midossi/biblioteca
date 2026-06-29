from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CollocazioneData(BaseModel):
    scaffale: str
    istituto: str


class AutoreData(BaseModel):
    nome: str
    cognome: str


class LibroData(BaseModel):
    isbn: str
    titolo: str
    quantita: int
    casa_editrice: str
    descrizione: str


class CreateBookPayload(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    isbn: str
    titolo: str
    genere: list[str] | str
    quantita: int
    casa_editrice: str
    descrizione: str
    istituto: str
    scaffale: str
    nome_autore: list[str]
    cognome_autore: list[str]


class UpdateBookPayload(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    isbn: str | None = None
    titolo: str | None = None
    genere: list[str] | str | None = None
    quantita: int | None = None
    casa_editrice: str | None = None
    descrizione: str | None = None
    nome_autore: list[str] | None = None
    cognome_autore: list[str] | None = None


class UpdateUserPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    nome: str | None = None
    cognome: str | None = None
    username: str | None = None
    ruolo: int | None = None
    email: str | None = None
