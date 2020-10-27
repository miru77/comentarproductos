export default function validarCrearProducto(valores) {
  let errores = {};

  //validar el nombre
  if (!valores.nombre) {
    errores.nombre = "El nombre es Obligatorio";
  }

  //validar empresa
  if (!valores.empresa) {
    errores.empresa = "El nombre de Empresa es Obligatorio";
  }

  //validar la url
  //validar la url
  if (!valores.url) {
    errores.url = "La URL es Obligatorio";
  } else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(valores.url)) {
    errores.url = "La URL no es válida";
  }

  //validar la descripcion
  if (!valores.descripcion) {
    errores.descripcion = "La descripcion  es Obligatorio";
  }

  return errores;
}
