import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { FirebaseContext } from "../../firebase";
import Layout from "../../components/layout/Layout";
import Error404 from "../../components/layout/404";
import styled, { css } from "styled-components";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { es } from "date-fns/locale";
import { Campo, InputSubmit } from "../../components/ui/Formulario";
import Boton from "../../components/ui/Boton";

const Titulo = styled.h1`
  margin-top: 5rem;
  text-align: center;
`;
const TituloComentario = styled.h2`
  margin: 2rem 0;
`;

const Votos = styled.p`
  text-align: center;
  margin-top: 5rem;
`;

const ContenedorProducto = styled.div`
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 2rem;
  }
`;
const CreadorProducto = styled.p`
  padding: 0.5rem 2rem;
  background-color: #da552f;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
  display: inline-block;
  text-align: center;
`;

export default function Producto() {
  const router = useRouter();
  const {
    query: { id },
  } = router;

  const [producto, guardarProducto] = useState({});
  const [error, guardarError] = useState(false);
  //constext de firebase
  const { firebase, usuario } = useContext(FirebaseContext);

  const [comentario, guardarComentario] = useState({});

  const [consultarDB, guardarConsularDB] = useState(true);

  useEffect(() => {
    if (id && consultarDB) {
      const obtenerProducto = async () => {
        const productoQuery = await firebase.db.collection("producto").doc(id);
        const producto = await productoQuery.get();

        if (producto.exists) {
          guardarProducto(producto.data());
          guardarConsularDB(false);
        } else {
          guardarError(true);
          guardarConsularDB(false);
        }
      };
      obtenerProducto();
    }
  }, [id]);

  if (Object.keys(producto).length === 0 && !error) return "Cargando...";

  const {
    comentarios,
    creado,
    descripcion,
    empresa,
    nombre,
    url,
    urlimagen,
    votos,
    creador,
    haVotado,
  } = producto;

  //validar los votos
  const votarProducto = () => {
    if (!usuario) {
      return router.push("/login");
    }
    // obtener y sumar voto
    const nuevoTotal = votos + 1;

    //verificar si ha votado
    if (haVotado.includes(usuario.uid)) return;

    const nuevoHaVotado = [...haVotado, usuario.uid];

    //actualuzar en BD
    firebase.db
      .collection("producto")
      .doc(id)
      .update({ votos: nuevoTotal, haVotado: nuevoHaVotado });

    //actualizar State
    guardarProducto({
      ...producto,
      votos: nuevoTotal,
    });
    guardarConsularDB(true); //hay 1 voto entonces se consulta a la bd otra vez
  };

  //funciones para crear comentario
  const comentarioChange = (e) => {
    guardarComentario({
      ...comentario,
      [e.target.name]: e.target.value,
    });
  };

  const esCreador = (id) => {
    if (creador.id == id) {
      return true;
    }
  };
  const agregarComentario = (e) => {
    e.preventDefault();

    if (!usuario) {
      return router.push("/login");
    }
    //informacion extra al comentario
    comentario.usuarioId = usuario.uid;
    comentario.usuarioNombre = usuario.displayName;

    //tomar copiade comentario y agregarlo al areglo
    const nuevosCometario = [...comentarios, comentario];

    //actualizar la bd
    firebase.db.collection("producto").doc(id).update({
      comentarios: nuevosCometario,
    });
    //actulalizar el state
    guardarProducto({
      ...producto,
      comentarios: nuevosCometario,
    });
    guardarConsularDB(true); //hay un comentario entonces se consulta la bd
  };
  const puedeBorrar = () => {
    if (!usuario) return false;

    if (creador.id === usuario.uid) {
      return true;
    }
  };

  //elimia un producto de la bd
  const eliminarProducto = async () => {
    if (!usuario) {
      return router.push("/login");
    }
    if (creador.id !== usuario.uid) {
      return router.push("/");
    }

    try {
      await firebase.db.collection("producto").doc(id).delete();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <>
        {error ? (
          <Error404 />
        ) : (
          <div className="contenedor">
            <Titulo>{nombre}</Titulo>
            <ContenedorProducto>
              <div>
                <p>
                  Publicado hace:{" "}
                  {formatDistanceToNow(new Date(creado), { locale: es })}
                </p>
                <p>
                  Por: {creador.nombre} de {empresa}
                </p>
                <img src={urlimagen} />
                <p>{descripcion}</p>
                {usuario && (
                  <>
                    <h2>Agrega tu comentario</h2>
                    <form onSubmit={agregarComentario}>
                      <Campo>
                        <input
                          type="text"
                          name="mensaje"
                          onChange={comentarioChange}
                        />
                        <InputSubmit type="submit" value="Agrega Comentario" />
                      </Campo>
                    </form>
                  </>
                )}
                <TituloComentario>Comentarios</TituloComentario>
                {comentarios.length === 0 ? (
                  "Aún no hay comentarios"
                ) : (
                  <ul>
                    {comentarios.map((comentario, i) => (
                      <li
                        key={`${comentario.usuarioId}-${i}`}
                        css={`
                          border: 1px solid #e1e1e1;
                          padding: 2rem;
                        `}
                      >
                        <p>{comentario.mensaje}</p>
                        <p>
                          Escrito por:
                          <span
                            css={`
                              font-weight: bold;
                            `}
                          >
                            {" "}
                            {comentario.usuarioNombre}
                          </span>
                        </p>
                        {esCreador(comentario.usuarioId) && (
                          <CreadorProducto>Es Creador</CreadorProducto>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <aside>
                <Boton target="_blank" bgColor="true" href={url}>
                  Visitar URL
                </Boton>
                <div>
                  <Votos>{votos} Votos</Votos>
                  {usuario && <Boton onClick={votarProducto}>Votar</Boton>}
                </div>
              </aside>
            </ContenedorProducto>

            {puedeBorrar() && (
              <Boton onClick={eliminarProducto}>Eliminar Producto</Boton>
            )}
          </div>
        )}
      </>
    </Layout>
  );
}
