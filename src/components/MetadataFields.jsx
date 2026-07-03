// Campos dinâmicos de metadata por tipo de item
const FIELDS_BY_TYPE = {
  musica: [
    { key: 'artist', label: 'Artista' },
    { key: 'album', label: 'Álbum' },
    { key: 'youtubeUrl', label: 'Link do YouTube' },
  ],
  filme: [
    { key: 'director', label: 'Diretor' },
    { key: 'year', label: 'Ano' },
  ],
  serie: [
    { key: 'creator', label: 'Criador' },
    { key: 'seasons', label: 'Temporadas' },
  ],
  anime: [
    { key: 'studio', label: 'Estúdio' },
    { key: 'seasons', label: 'Temporadas' },
  ],
  jogo: [
    { key: 'developer', label: 'Desenvolvedora' },
    { key: 'year', label: 'Ano' },
    { key: 'platform', label: 'Plataforma' },
  ],
  livro: [
    { key: 'author', label: 'Autor' },
    { key: 'publisher', label: 'Editora' },
  ],
  personagem: [{ key: 'origin', label: 'Origem (obra)' }],
  carro: [
    { key: 'brand', label: 'Marca' },
    { key: 'year', label: 'Ano' },
  ],
  comida: [{ key: 'cuisine', label: 'Culinária' }],
  outro: [],
};

export function metadataFields(type) {
  return FIELDS_BY_TYPE[type] || [];
}

export default function MetadataFields({ type, metadata, onChange }) {
  const fields = metadataFields(type);
  if (!fields.length) return null;
  return (
    <>
      {fields.map((f) => (
        <div className="field" key={f.key}>
          <label>{f.label}</label>
          <input
            className="input"
            value={metadata[f.key] || ''}
            onChange={(e) => onChange({ ...metadata, [f.key]: e.target.value })}
          />
        </div>
      ))}
    </>
  );
}
