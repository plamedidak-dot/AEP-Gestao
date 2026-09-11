// ============================================================
// AEP-2 - GESTÃO DE MEMBROS
// membros.js
// ============================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ============================================================
// ELEMENTOS
// ============================================================

const memberForm = document.getElementById("memberForm");
const membersTableBody = document.getElementById("membersTableBody");

const searchInput = document.getElementById("searchInput");
const cargoFilter = document.getElementById("cargoFilter");
const statusFilter = document.getElementById("statusFilter");

const modal = document.getElementById("memberModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const newMemberBtn = document.getElementById("newMemberBtn");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");


// ============================================================
// CAMPOS DO FORMULÁRIO
// ============================================================

const nome = document.getElementById("nome");
const matricula = document.getElementById("matricula");
const telefone = document.getElementById("telefone");
const classe = document.getElementById("classe");
const curso = document.getElementById("curso");
const cargo = document.getElementById("cargo");
const departamento = document.getElementById("departamento");
const estado = document.getElementById("estado");


// ============================================================
// ESTADO
// ============================================================

let members = [];
let editingMemberId = null;
let deletingMemberId = null;


// ============================================================
// CARGOS EXCLUSIVOS
// ============================================================

const cargosExclusivos = [
    "Presidente",
    "Vice-Presidente",
    "Secretária",
    "Tesoureiro"
];


// ============================================================
// AUTENTICAÇÃO
// ============================================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    loadMembers();
});


// ============================================================
// CARREGAR MEMBROS
// ============================================================

async function loadMembers() {

    try {

        const snapshot = await getDocs(
            collection(db, "membros")
        );

        members = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
        }));

        sortMembers();
        renderMembers();
        updateStats();
        updateDirection();

    } catch (error) {

        console.error("Erro ao carregar membros:", error);

        showMessage(
            "Não foi possível carregar os membros.",
            "error"
        );
    }
}


// ============================================================
// ORDENAR A-Z
// ============================================================

function sortMembers() {

    members.sort((a, b) => {

        const nomeA = (a.nome || "").trim();
        const nomeB = (b.nome || "").trim();

        return nomeA.localeCompare(
            nomeB,
            "pt",
            {
                sensitivity: "base"
            }
        );
    });
}


// ============================================================
// MOSTRAR MEMBROS
// ============================================================

function renderMembers() {

    if (!membersTableBody) return;

    const pesquisa =
        (searchInput?.value || "")
            .toLowerCase()
            .trim();

    const filtroCargo =
        cargoFilter?.value || "";

    const filtroEstado =
        statusFilter?.value || "";


    const filtrados = members.filter((member) => {

        const texto = [

            member.nome,
            member.matricula,
            member.telefone,
            member.classe,
            member.curso,
            member.cargo,
            member.departamento

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        const correspondePesquisa =
            !pesquisa ||
            texto.includes(pesquisa);


        const correspondeCargo =
            !filtroCargo ||
            member.cargo === filtroCargo;


        const correspondeEstado =
            !filtroEstado ||
            member.estado === filtroEstado;


        return (
            correspondePesquisa &&
            correspondeCargo &&
            correspondeEstado
        );
    });


    membersTableBody.innerHTML = "";


    if (filtrados.length === 0) {

        membersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    Nenhum membro encontrado.
                </td>
            </tr>
        `;

        return;
    }


    filtrados.forEach((member, index) => {

        const tr = document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                <strong>
                    ${escapeHTML(member.nome || "Sem nome")}
                </strong>
            </td>

            <td>
                ${escapeHTML(member.matricula || "-")}
            </td>

            <td>
                ${escapeHTML(member.classe || "-")}
                ${member.curso
                    ? `<br><small>${escapeHTML(member.curso)}</small>`
                    : ""
                }
            </td>

            <td>
                ${getCargoBadge(member.cargo)}
            </td>

            <td>
                ${escapeHTML(member.departamento || "-")}
            </td>

            <td>
                ${escapeHTML(member.telefone || "-")}
            </td>

            <td>
                ${getStatusBadge(member.estado)}
            </td>

            <td class="actions">

                <button
                    class="btn-edit"
                    onclick="editMember('${member.id}')"
                    title="Editar"
                >
                    ✏️
                </button>

                <button
                    class="btn-delete"
                    onclick="openDeleteModal('${member.id}')"
                    title="Eliminar"
                >
                    🗑️
                </button>

            </td>
        `;


        membersTableBody.appendChild(tr);
    });
}


// ============================================================
// BADGE DO CARGO
// ============================================================

function getCargoBadge(cargoValue) {

    if (!cargoValue) {

        return `
            <span class="badge badge-member">
                Membro
            </span>
        `;
    }


    let classeBadge = "badge-member";


    if (cargoValue === "Presidente") {
        classeBadge = "badge-president";
    }

    else if (cargoValue === "Vice-Presidente") {
        classeBadge = "badge-vice";
    }

    else if (cargoValue === "Secretária") {
        classeBadge = "badge-secretary";
    }

    else if (cargoValue === "Tesoureiro") {
        classeBadge = "badge-treasurer";
    }


    return `
        <span class="badge ${classeBadge}">
            ${escapeHTML(cargoValue)}
        </span>
    `;
}


// ============================================================
// BADGE DO ESTADO
// ============================================================

function getStatusBadge(status) {

    if (status === "Ativo") {

        return `
            <span class="status active">
                Ativo
            </span>
        `;
    }


    if (status === "Inativo") {

        return `
            <span class="status inactive">
                Inativo
            </span>
        `;
    }


    if (status === "Suspenso") {

        return `
            <span class="status suspended">
                Suspenso
            </span>
        `;
    }


    return `
        <span class="status">
            ${escapeHTML(status || "Ativo")}
        </span>
    `;
}


// ============================================================
// ESTATÍSTICAS
// ============================================================

function updateStats() {

    const totalElement =
        document.getElementById("totalMembers");

    const activeElement =
        document.getElementById("activeMembers");

    const inactiveElement =
        document.getElementById("inactiveMembers");

    const leadershipElement =
        document.getElementById("leadershipMembers");


    if (totalElement) {

        totalElement.textContent =
            members.length;
    }


    if (activeElement) {

        activeElement.textContent =
            members.filter(
                member => member.estado === "Ativo"
            ).length;
    }


    if (inactiveElement) {

        inactiveElement.textContent =
            members.filter(
                member => member.estado !== "Ativo"
            ).length;
    }


    if (leadershipElement) {

        leadershipElement.textContent =
            members.filter(
                member =>
                    cargosExclusivos.includes(member.cargo)
            ).length;
    }
}


// ============================================================
// PAINEL DA DIREÇÃO DA AEP-2
// ============================================================

function updateDirection() {

    const directionContainer =
        document.getElementById("directionContainer");


    // Se o HTML ainda não tiver o painel,
    // simplesmente não faz nada.
    if (!directionContainer) return;


    const cargos = [

        {
            cargo: "Presidente",
            icon: "👑"
        },

        {
            cargo: "Vice-Presidente",
            icon: "⭐"
        },

        {
            cargo: "Secretária",
            icon: "📝"
        },

        {
            cargo: "Tesoureiro",
            icon: "💰"
        }

    ];


    directionContainer.innerHTML = "";


    cargos.forEach((item) => {

        const membro = members.find(
            member =>
                member.cargo === item.cargo
        );


        const nomeMembro =
            membro?.nome || "Ainda não definido";


        const matriculaMembro =
            membro?.matricula
                ? `Nº ${escapeHTML(membro.matricula)}`
                : "";


        const card =
            document.createElement("div");


        card.className =
            "direction-card";


        card.innerHTML = `

            <div class="direction-icon">
                ${item.icon}
            </div>

            <div class="direction-info">

                <span class="direction-role">
                    ${item.cargo}
                </span>

                <strong>
                    ${escapeHTML(nomeMembro)}
                </strong>

                ${
                    matriculaMembro
                        ? `<small>${matriculaMembro}</small>`
                        : ""
                }

            </div>
        `;


        directionContainer.appendChild(card);
    });
}


// ============================================================
// ABRIR MODAL DE NOVO MEMBRO
// ============================================================

newMemberBtn?.addEventListener(
    "click",
    () => {

        editingMemberId = null;

        memberForm?.reset();

        if (modalTitle) {
            modalTitle.textContent =
                "Novo Membro";
        }

        if (estado) {
            estado.value = "Ativo";
        }

        if (cargo) {
            cargo.value = "Membro";
        }

        openModal();
    }
);


// ============================================================
// FECHAR MODAL
// ============================================================

closeModalBtn?.addEventListener(
    "click",
    closeModal
);

cancelBtn?.addEventListener(
    "click",
    closeModal
);


function openModal() {

    if (!modal) return;

    modal.classList.add("active");
}


function closeModal() {

    if (!modal) return;

    modal.classList.remove("active");

    editingMemberId = null;

    memberForm?.reset();
}


// ============================================================
// GUARDAR MEMBRO
// ============================================================

memberForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const nomeValue =
            nome.value.trim();

        const matriculaValue =
            matricula.value.trim();

        const telefoneValue =
            telefone.value.trim();

        const classeValue =
            classe.value.trim();

        const cursoValue =
            curso.value.trim();

        const cargoValue =
            cargo.value;

        const departamentoValue =
            departamento.value.trim();

        const estadoValue =
            estado.value;


        if (!nomeValue) {

            showMessage(
                "Digite o nome completo.",
                "error"
            );

            return;
        }


        try {

            // ------------------------------------------------
            // VERIFICAR CARGO DE DIREÇÃO
            // ------------------------------------------------

            if (
                cargosExclusivos.includes(
                    cargoValue
                )
            ) {

                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            "membros"
                        )
                    );


                const membroExistente =
                    snapshot.docs.find(
                        (item) => {

                            const data =
                                item.data();


                            // Ignorar o próprio membro
                            // quando estamos a editar.
                            if (
                                editingMemberId &&
                                item.id ===
                                editingMemberId
                            ) {
                                return false;
                            }


                            return (
                                data.cargo ===
                                cargoValue
                            );
                        }
                    );


                if (membroExistente) {

                    const data =
                        membroExistente.data();


                    showMessage(
                        `Já existe um ${cargoValue} cadastrado: ${
                            data.nome ||
                            "membro sem nome"
                        }.`,
                        "error"
                    );

                    return;
                }
            }


            // ------------------------------------------------
            // OBJETO DO MEMBRO
            // ------------------------------------------------

            const memberData = {

                nome: nomeValue,

                matricula: matriculaValue,

                telefone: telefoneValue,

                classe: classeValue,

                curso: cursoValue,

                cargo: cargoValue,

                departamento:
                    departamentoValue,

                estado: estadoValue,

                updatedAt:
                    serverTimestamp()
            };


            // ------------------------------------------------
            // EDITAR
            // ------------------------------------------------

            if (editingMemberId) {

                await updateDoc(
                    doc(
                        db,
                        "membros",
                        editingMemberId
                    ),
                    memberData
                );


                showMessage(
                    "Membro atualizado com sucesso!",
                    "success"
                );
            }


            // ------------------------------------------------
            // NOVO MEMBRO
            // ------------------------------------------------

            else {

                await addDoc(
                    collection(
                        db,
                        "membros"
                    ),
                    {
                        ...memberData,

                        createdAt:
                            serverTimestamp()
                    }
                );


                showMessage(
                    "Membro cadastrado com sucesso!",
                    "success"
                );
            }


            closeModal();

            await loadMembers();

        }

        catch (error) {

            console.error(
                "Erro ao guardar membro:",
                error
            );


            showMessage(
                "Ocorreu um erro ao guardar o membro.",
                "error"
            );
        }
    }
);


// ============================================================
// EDITAR MEMBRO
// ============================================================

window.editMember = function (id) {

    const member =
        members.find(
            item => item.id === id
        );


    if (!member) return;


    editingMemberId = id;


    nome.value =
        member.nome || "";

    matricula.value =
        member.matricula || "";

    telefone.value =
        member.telefone || "";

    classe.value =
        member.classe || "";

    curso.value =
        member.curso || "";

    cargo.value =
        member.cargo || "Membro";

    departamento.value =
        member.departamento || "";

    estado.value =
        member.estado || "Ativo";


    if (modalTitle) {

        modalTitle.textContent =
            "Editar Membro";
    }


    openModal();
};


// ============================================================
// ELIMINAR MEMBRO
// ============================================================

window.openDeleteModal = function (id) {

    deletingMemberId = id;


    if (deleteModal) {

        deleteModal.classList.add(
            "active"
        );
    }
};


cancelDeleteBtn?.addEventListener(
    "click",
    () => {

        deletingMemberId = null;

        deleteModal?.classList.remove(
            "active"
        );
    }
);


confirmDeleteBtn?.addEventListener(
    "click",
    async () => {

        if (!deletingMemberId) return;


        try {

            await deleteDoc(
                doc(
                    db,
                    "membros",
                    deletingMemberId
                )
            );


            showMessage(
                "Membro eliminado com sucesso!",
                "success"
            );


            deletingMemberId = null;


            deleteModal?.classList.remove(
                "active"
            );


            await loadMembers();

        }

        catch (error) {

            console.error(
                "Erro ao eliminar:",
                error
            );


            showMessage(
                "Não foi possível eliminar o membro.",
                "error"
            );
        }
    }
);


// ============================================================
// PESQUISA E FILTROS
// ============================================================

searchInput?.addEventListener(
    "input",
    renderMembers
);

cargoFilter?.addEventListener(
    "change",
    renderMembers
);

statusFilter?.addEventListener(
    "change",
    renderMembers
);


// ============================================================
// FECHAR MODAIS AO CLICAR FORA
// ============================================================

window.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modal
        ) {
            closeModal();
        }


        if (
            event.target === deleteModal
        ) {

            deleteModal.classList.remove(
                "active"
            );

            deletingMemberId = null;
        }
    }
);


// ============================================================
// MENSAGENS
// ============================================================

function showMessage(
    message,
    type = "success"
) {

    let container =
        document.getElementById(
            "messageContainer"
        );


    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "messageContainer";

        document.body.appendChild(
            container
        );
    }


    const notification =
        document.createElement("div");


    notification.className =
        `notification ${type}`;


    notification.textContent =
        message;


    container.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.classList.add(
                "hide"
            );

            setTimeout(
                () =>
                    notification.remove(),
                300
            );

        },
        3500
    );
}


// ============================================================
// SEGURANÇA DO HTML
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// GERAR PDF DA LISTA
// ============================================================

window.generateMembersPDF =
    async function () {

        if (!members.length) {

            showMessage(
                "Não existem membros para gerar o PDF.",
                "error"
            );

            return;
        }


        try {

            const {
                jsPDF
            } = window.jspdf;


            const docPDF =
                new jsPDF({
                    orientation: "landscape",
                    unit: "mm",
                    format: "a4"
                });


            // ------------------------------------------------
            // LOGOS
            // ------------------------------------------------

            const logoEscola =
                await loadImage(
                    "./img/logo-escola.png"
                );


            const logoAEP2 =
                await loadImage(
                    "./img/logo-aep2.png"
                );


            if (logoEscola) {

                docPDF.addImage(
                    logoEscola,
                    "PNG",
                    15,
                    10,
                    25,
                    25
                );
            }


            if (logoAEP2) {

                docPDF.addImage(
                    logoAEP2,
                    "PNG",
                    257,
                    10,
                    25,
                    25
                );
            }


            // ------------------------------------------------
            // CABEÇALHO
            // ------------------------------------------------

            docPDF.setFontSize(16);

            docPDF.setFont(
                "helvetica",
                "bold"
            );


            docPDF.text(
                "ASSOCIAÇÃO DOS ESTUDANTES DO PROGLORY-2",
                148,
                15,
                {
                    align: "center"
                }
            );


            docPDF.setFontSize(11);

            docPDF.setFont(
                "helvetica",
                "normal"
            );


            docPDF.text(
                "Complexo Escolar Privado Proglory-2",
                148,
                21,
                {
                    align: "center"
                }
            );


            docPDF.setFontSize(13);

            docPDF.setFont(
                "helvetica",
                "bold"
            );


            docPDF.text(
                "LISTA DE MEMBROS",
                148,
                30,
                {
                    align: "center"
                }
            );


            docPDF.setFontSize(8);

            docPDF.setFont(
                "helvetica",
                "normal"
            );


            const dataAtual =
                new Date()
                    .toLocaleDateString(
                        "pt-AO"
                    );


            docPDF.text(
                `Data: ${dataAtual}`,
                148,
                36,
                {
                    align: "center"
                }
            );


            // ------------------------------------------------
            // LINHA
            // ------------------------------------------------

            docPDF.setLineWidth(1);

            docPDF.line(
                15,
                40,
                282,
                40
            );


            // ------------------------------------------------
            // DADOS ORDENADOS
            // ------------------------------------------------

            const membrosPDF =
                [...members].sort(
                    (a, b) =>
                        (a.nome || "")
                            .localeCompare(
                                b.nome || "",
                                "pt",
                                {
                                    sensitivity:
                                        "base"
                                }
                            )
                );


            const rows =
                membrosPDF.map(
                    (member, index) => [

                        index + 1,

                        member.nome || "-",

                        member.matricula || "-",

                        `${member.classe || "-"}${
                            member.curso
                                ? ` / ${member.curso}`
                                : ""
                        }`,

                        member.cargo ||
                            "Membro",

                        member.departamento ||
                            "-",

                        member.telefone ||
                            "-",

                        member.estado ||
                            "Ativo"
                    ]
                );


            // ------------------------------------------------
            // TABELA
            // ------------------------------------------------

            docPDF.autoTable({

                startY: 44,

                head: [[

                    "Nº",

                    "Nome completo",

                    "Nº de membro",

                    "Classe / Curso",

                    "Cargo / Função",

                    "Departamento",

                    "Telefone",

                    "Estado"

                ]],

                body: rows,

                theme: "grid",

                styles: {

                    fontSize: 7,

                    cellPadding: 2,

                    valign: "middle"
                },

                headStyles: {

                    fontSize: 7,

                    fontStyle: "bold"
                },

                margin: {

                    left: 15,

                    right: 15
                }
            });


            // ------------------------------------------------
            // TOTAL
            // ------------------------------------------------

            const finalY =
                docPDF.lastAutoTable.finalY;


            docPDF.setFontSize(9);

            docPDF.setFont(
                "helvetica",
                "bold"
            );


            docPDF.text(
                `Total de membros: ${membrosPDF.length}`,
                15,
                finalY + 8
            );


            // ------------------------------------------------
            // RODAPÉ
            // ------------------------------------------------

            const totalPaginas =
                docPDF.internal.getNumberOfPages();


            for (
                let i = 1;
                i <= totalPaginas;
                i++
            ) {

                docPDF.setPage(i);

                docPDF.setFontSize(7);

                docPDF.setFont(
                    "helvetica",
                    "normal"
                );


                docPDF.text(
                    `AEP-2 • Página ${i} de ${totalPaginas}`,
                    148,
                    202,
                    {
                        align: "center"
                    }
                );
            }


            docPDF.save(
                "lista-de-membros-aep2.pdf"
            );


            showMessage(
                "PDF gerado com sucesso!",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Erro ao gerar PDF:",
                error
            );


            showMessage(
                "Não foi possível gerar o PDF.",
                "error"
            );
        }
    };


// ============================================================
// CARREGAR IMAGEM PARA PDF
// ============================================================

function loadImage(url) {

    return new Promise(
        (resolve) => {

            const image =
                new Image();


            image.crossOrigin =
                "anonymous";


            image.onload =
                () => resolve(image);


            image.onerror =
                () => resolve(null);


            image.src = url;
        }
    );
}             3: {
                    cellWidth:
                        34
                },

                4: {
                    cellWidth:
                        35
                },

                5: {
                    cellWidth:
                        36
                },

                6: {
                    cellWidth:
                        28
                },

                7: {
                    halign:
                        "center",
                    cellWidth:
                        22
                }

            },


            margin: {

                left:
                    15,

                right:
                    15

            },


            didParseCell:
                function(data) {

                    if (
                        data.section ===
                        "body" &&
                        data.column.index ===
                        7
                    ) {

                        if (
                            data.cell.raw ===
                            "Ativo"
                        ) {

                            data.cell.styles.textColor =
                                [
                                    22,
                                    163,
                                    74
                                ];

                        }


                        if (
                            data.cell.raw ===
                            "Inativo"
                        ) {

                            data.cell.styles.textColor =
                                [
                                    220,
                                    38,
                                    38
                                ];

                        }

                    }

                }

        });


        // ====================================================
        // TOTAL
        // ====================================================

        let finalY =
            pdf.lastAutoTable.finalY +
            9;


        if (
            finalY >
            pageHeight - 25
        ) {

            pdf.addPage();

            finalY = 20;

        }


        pdf.setTextColor(
            30,
            30,
            30
        );


        pdf.setFont(
            "helvetica",
            "bold"
        );


        pdf.setFontSize(
            9
        );


        pdf.text(
            `Total de membros: ${pdfMembers.length}`,
            15,
            finalY
        );


        // ====================================================
        // RODAPÉ DE TODAS AS PÁGINAS
        // ====================================================

        const totalPages =
            pdf.internal
                .getNumberOfPages();


        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {

            pdf.setPage(i);


            pdf.setTextColor(
                100,
                100,
                100
            );


            pdf.setFont(
                "helvetica",
                "normal"
            );


            pdf.setFontSize(
                7.5
            );


            pdf.text(
                "AEP-2 — Sistema de Gestão",
                15,
                pageHeight - 9
            );


            pdf.text(
                `Página ${i} de ${totalPages}`,
                pageWidth - 15,
                pageHeight - 9,
                {
                    align:
                        "right"
                }
            );

        }


        // ====================================================
        // GUARDAR PDF
        // ====================================================

        const filename =
            `lista-membros-AEP2-${getDateForFilename()}.pdf`;


        pdf.save(
            filename
        );


    } catch (error) {

        console.error(
            "Erro ao gerar PDF:",
            error
        );


        alert(
            "Não foi possível gerar o PDF."
        );


    } finally {

        generatePdfBtn.disabled =
            false;


        generatePdfBtn.innerHTML = `
            <i class="fa-solid fa-file-pdf"></i>
            Gerar PDF da Lista
        `;

    }

}


// ============================================================
// CARREGAR IMAGEM
// ============================================================

function loadImage(url) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();


            img.crossOrigin =
                "anonymous";


            img.onload =
                () => {

                    resolve(img);

                };


            img.onerror =
                () => {

                    reject(
                        new Error(
                            `Imagem não encontrada: ${url}`
                        )
                    );

                };


            img.src =
                url;

        }
    );

}


// ============================================================
// DATA PARA O NOME DO PDF
// ============================================================

function getDateForFilename() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


// ============================================================
// MENSAGEM DO FORMULÁRIO
// ============================================================

function showFormMessage(
    message,
    type
) {

    formMessage.textContent =
        message;


    formMessage.className =
        `form-message ${type}`;

}


// ============================================================
// PROTEÇÃO HTML
// ============================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ============================================================
// MENU MOBILE
// ============================================================

menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


// ============================================================
// LOGOUT
// ============================================================

logoutBtn.addEventListener(
    "click",
    async () => {

        const confirmar =
            confirm(
                "Deseja terminar a sessão?"
            );


        if (!confirmar)
            return;


        try {

            await signOut(
                auth
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Erro ao terminar sessão:",
                error
            );


            alert(
                "Não foi possível terminar a sessão."
            );

        }

    }
);