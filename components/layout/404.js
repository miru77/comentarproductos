import React from "react";
import styled from "styled-components";

const TextoDescripcion = styled.div`
  margin-top: 5rem;
  text-align: center;
`;

export default function Error404() {
  return (
    <TextoDescripcion>
      <h1>No se puede mostrar</h1>
    </TextoDescripcion>
  );
}
