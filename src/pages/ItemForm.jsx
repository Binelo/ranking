import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import CategoryPicker from '../components/CategoryPicker.jsx';
import MetadataFields from '../components/MetadataFields.jsx';

const TYPES = [
  ['musica', 'Música'], ['filme', 'Filme'], ['serie', 'Série'], ['anime', 'Anime'],
  ['jogo', 'Jogo'], ['personagem', 'Personagem'], ['carro', 'Carro'], ['comida', 'Comida'],
  ['livro', 'Livro'], ['outro', 'Outro'],
];

export default function ItemForm({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const nameRef = useRef(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('outro');
  const [image, setImage] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [file, setFile] = useState(null);
  const [s3Enabled, setS3Enabled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null); // último item criado { _id, name }

  useEffect(() => {
    api.get('/upload/status').then((res) => setS3Enabled(res.data.s3Enabled)).catch(() => {});
    if (!edit) return;
    api.get(`/items/${id}`).then((res) => {
      const i = res.data.item;
      setName(i.name);
      setType(i.type);
      setImage(i.image || '');
      setCategories((i.categories || []).map((c) => c._id));
      setMetadata(i.metadata || {});
    });
  }, [edit, id]);

  async function uploadToS3() {
    const presign = await api.post('/upload/presign', { fileName: file.name, contentType: file.type });
    await fetch(presign.data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    return presign.data.publicUrl;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let imageUrl = image;
      if (imageMode === 'upload' && file) imageUrl = await uploadToS3();
      const body = { name, type, image: imageUrl, categories, metadata };

      if (edit) {
        const res = await api.put(`/items/${id}`, body);
        navigate(`/item/${res.data.item._id}`);
        return;
      }

      // criação: permanece na tela para criar itens parecidos —
      // limpa só o nome, mantém tipo, imagem, categorias e metadata
      const res = await api.post('/items', body);
      setCreated(res.data.item);
      setName('');
      setFile(null);
      nameRef.current?.focus();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-card form-wide" onSubmit={submit}>
      <h1>{edit ? 'Editar item' : 'Criar novo item'}</h1>
      {error && <div className="error-box">{error}</div>}

      {created && (
        <div className="success-box">
          ✅ <b>{created.name}</b> criado!{' '}
          <Link to={`/item/${created._id}`} style={{ color: 'var(--blue)' }}>Ver item</Link>
          <span className="muted"> · os campos foram mantidos para criar outro parecido</span>
        </div>
      )}

      <div className="field">
        <label>Nome</label>
        <input
          ref={nameRef}
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex: Bohemian Rhapsody"
        />
      </div>
      <div className="field">
        <label>Tipo</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Imagem</label>
        <div className="row" style={{ marginBottom: 8 }}>
          <button type="button" className={`btn btn-sm ${imageMode === 'url' ? 'btn-primary' : ''}`} onClick={() => setImageMode('url')}>
            Link (URL)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${imageMode === 'upload' ? 'btn-primary' : ''}`}
            onClick={() => setImageMode('upload')}
            disabled={!s3Enabled}
            title={s3Enabled ? '' : 'Upload S3 não configurado no servidor'}
          >
            Upload de arquivo {!s3Enabled && '(indisponível)'}
          </button>
        </div>
        {imageMode === 'url' ? (
          <input className="input" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
        ) : (
          <input className="input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        )}
        {imageMode === 'url' && image && (
          <img src={image} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 9, marginTop: 10 }} />
        )}
      </div>

      <CategoryPicker selected={categories} onChange={setCategories} />

      <MetadataFields type={type} metadata={metadata} onChange={setMetadata} />

      <button className="btn btn-primary" disabled={busy}>
        {busy ? 'Salvando…' : edit ? 'Salvar alterações' : created ? 'Criar mais um' : 'Criar item'}
      </button>
    </form>
  );
}
