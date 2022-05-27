const URL_BASE = "https://api.box3.work/api/Contato";
const TOKEN = "8c6a8978-4211-4ecb-bfe8-a7597f2ca06e";

const limparTabela = () => {
  const tBody = document.querySelector("table tbody");
  tBody.innerHTML = "";
};

const formatarData = (data) => {
  const dataFormatada = new Date(data);
  const dia = String(dataFormatada.getDate()).padStart(2, "0");
  const mes = String(dataFormatada.getMonth() + 1).padStart(2, "0");
  const ano = dataFormatada.getFullYear();

  return `${dia}/${mes}/${ano}`;
};

const formatarStatus = (status) => {
  return `
  <i
    class="bi bi-record-fill"
    style="color: ${status ? "#4b8854" : "#dc3545"}; font-size: 25px"
  ></i>
  `;
};

const inserirLinha = (dados) => {
  const tableBody = document.getElementById("tbody");

  const { id, nome, telefone, dataNascimento, email, ativo } = dados;

  const tr = document.createElement("tr");

  const info = [
    nome,
    telefone,
    email,
    formatarData(dataNascimento),
    formatarStatus(ativo),
  ];

  for (let i = 0; i < 5; i++) {
    const td = document.createElement("td");
    td.class = "text-center";
    td.innerHTML = info[i];
    tr.appendChild(td);
  }

  const td = document.createElement("td");
  const btnEditar = document.createElement("button");
  btnEditar.setAttribute("type", "button");
  btnEditar.setAttribute("data-bs-toggle", "modal");
  btnEditar.setAttribute("data-bs-target", "#editContactModal");
  btnEditar.className = "btn btn-primary mx-2";
  btnEditar.innerHTML = `
  <i
    class="bi bi-pencil-fill"
    style="font-size: 15px; color: #fff"
  ></i>
  `;

  const btnDeletar = document.createElement("button");
  btnDeletar.setAttribute("type", "button");
  btnDeletar.setAttribute("data-bs-toggle", "modal");
  btnDeletar.setAttribute("data-bs-target", "#deleteContactModal");
  btnDeletar.className = "btn btn-danger";
  btnDeletar.innerHTML = `
  <i
    class="bi bi-trash-fill"
    style="font-size: 15px; color: #fff"
  ></i>
  `;

  btnEditar.addEventListener("click", () => {
    editarContato({ id, nome, telefone, dataNascimento, email, ativo });
  });

  btnDeletar.addEventListener("click", () => {
    removerContato(id, tr);
  });

  td.appendChild(btnEditar);
  td.appendChild(btnDeletar);
  td.className = "text-center";
  tr.appendChild(td);
  tr.className = "text-center";

  tableBody.appendChild(tr);
};

const preencherTabela = (data) => {
  limparTabela();

  if (data.length > 0) {
    data.forEach(inserirLinha);
  } else {
    const tBody = document.querySelector("table tbody");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.className = "text-center mt-5";
    td.colSpan = 6;
    td.innerHTML = "Nenhum contato encontrado";
    tr.appendChild(td);
    tBody.appendChild(tr);
  }
};

const obterDados = async () => {
  try {
    const response = await fetch(`${URL_BASE}/${TOKEN}`);
    const data = await response.json();

    preencherTabela(data);
  } catch (e) {
    console.error(e);
  }
};

const enviarDados = async (data) => {
  try {
    const options = {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    };
    const response = await fetch(`${URL_BASE}/${TOKEN}`, options);
    return response.status;
  } catch (e) {
    console.error(e);
  }
};

const atualizarDado = async (data, id) => {
  try {
    const options = {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    };
    await fetch(`${URL_BASE}/${TOKEN}/${id}`, options);
  } catch (e) {
    console.error(e);
  }
};

const deletarDado = async (id) => {
  try {
    const options = {
      method: "DELETE",
    };
    const response = await fetch(`${URL_BASE}/${TOKEN}/${id}`, options);
  } catch (e) {
    console.error(e);
  }
};

const atualizarTabela = () => {
  limparTabela();
  obterDados();
};

const editarContato = (data) => {
  const { id, nome, telefone, dataNascimento, email, ativo } = data;

  const editarContatoModal = document.getElementById("editContactModal");
  const form = editarContatoModal.querySelector("form");

  const nomeInput = form.querySelector(".nome");
  const emailInput = form.querySelector(".email");
  const telefoneInput = form.querySelector(".telefone");
  const dataNascimentoInput = form.querySelector(".dataNascimento");
  const ativoInput = form.querySelector(".ativo");
  const buttonSubmit = form.querySelector('button[type="submit"]');

  const arrData = String(dataNascimento).split("-");
  const dataFormatada =
    arrData[0] + "-" + arrData[1] + "-" + arrData[2].split("T")[0];

  nomeInput.value = nome;
  emailInput.value = email;
  telefoneInput.value = telefone;
  dataNascimentoInput.value = dataFormatada;
  ativoInput.checked = ativo;

  buttonSubmit.addEventListener("click", (e) => {
    e.preventDefault();

    const novosDados = {
      nome: nomeInput.value,
      email: emailInput.value,
      telefone: telefoneInput.value,
      dataNascimento: dataNascimentoInput.value,
      ativo: ativoInput.checked,
    };

    atualizarDado(novosDados, id)
      .then(() => {
        fecharModal("edit");
        window.location.reload();
      })
      .catch(() =>
        alert(
          "Ocorreu um erro ao atualizar contato, por favor tente novamente.",
        ),
      );
  });
};

const fecharModal = (nomeModal) => {
  const modal = document.querySelector(`.${nomeModal}-contact-modal`);
  const btnClose = modal.querySelector(".btn-close");
  btnClose.click();
};

const removerContato = (id, tr) => {
  const confirmacao = document.getElementById("deletar");

  confirmacao.addEventListener("click", () => {
    fecharModal("delete");

    deletarDado(id)
      .then(() => {
        tr.remove();
      })
      .catch(() =>
        alert(
          "Ocorreu um error ao deletar contato, por favor tente novamente.",
        ),
      );
  });
};

const adicionarContato = (e) => {
  e.preventDefault();

  const form = document.getElementById("novoContatoForm");

  const dados = {
    nome: document.querySelector("#nome").value,
    email: document.querySelector("#email").value,
    telefone: document.querySelector("#telefone").value,
    dataNascimento: document.querySelector("#dataNascimento").value,
    ativo: document.querySelector("#ativo").checked,
  };

  if (dados.nome && dados.email && dados.telefone && dados.dataNascimento) {
    enviarDados(dados)
      .then((res) => {
        if (res === 200) {
          fecharModal("new");
          atualizarTabela();
          form.reset();
        }
      })
      .catch(() =>
        alert(
          "Ocorreu um erro ao adicionar contato, por favor tente novamente.",
        ),
      );
  }
};

window.onload = function () {
  const novoContatoForm = document.getElementById("novoContatoForm");
  novoContatoForm.addEventListener("submit", adicionarContato);

  const reload = document.querySelector(".reload");
  reload.addEventListener("click", obterDados);

  obterDados();
};

// Máscara para o telefone

function mask(o, f) {
  setTimeout(function () {
    let v = mphone(o.value);
    if (v != o.value) {
      o.value = v;
    }
  }, 1);
}

function mphone(v) {
  let r = v.replace(/\D/g, "");
  r = r.replace(/^0/, "");

  if (r.length > 10) {
    r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (r.length > 5) {
    r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (r.length > 2) {
    r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
  } else {
    r = r.replace(/^(\d*)/, "($1");
  }

  return r;
}
