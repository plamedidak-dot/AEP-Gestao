/* =========================================
   DASHBOARD AEP-2
========================================= */

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getCountFromServer
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================
   ELEMENTOS
========================================= */

const userEmail =
    document.getElementById("userEmail");

const logoutButton =
    document.getElementById("logoutButton");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

const totalMembers =
    document.getElementById("totalMembers");

const totalDepartments =
    document.getElementById("totalDepartments");

const totalPresences =
    document.getElementById("totalPresences");

const totalMeetings =
    document.getElementById("totalMeetings");


/* =========================================
   PROTEGER DASHBOARD
========================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        /* Mostrar utilizador */

        if (userEmail) {

            userEmail.textContent =
                user.email || "Utilizador";
        }


        /* Carregar estatísticas */

        await loadStatistics();

    }
);


/* =========================================
   ESTATÍSTICAS FIRESTORE
========================================= */

async function loadStatistics() {

    try {

        const members =
            await getCollectionCount(
                "membros"
            );

        const departments =
            await getCollectionCount(
                "departamentos"
            );

        const presences =
            await getCollectionCount(
                "presencas"
            );

        const meetings =
            await getCollectionCount(
                "reunioes"
            );


        /* -------------------------------
           ATUALIZAR DASHBOARD
        -------------------------------- */

        if (totalMembers) {

            totalMembers.textContent =
                members;
        }


        if (totalDepartments) {

            totalDepartments.textContent =
                departments;
        }


        if (totalPresences) {

            totalPresences.textContent =
                presences;
        }


        if (totalMeetings) {

            totalMeetings.textContent =
                meetings;
        }


    } catch (error) {

        console.error(
            "Erro ao carregar estatísticas:",
            error
        );

    }

}


/* =========================================
   CONTAR DOCUMENTOS FIRESTORE
========================================= */

async function getCollectionCount(
    collectionName
) {

    try {

        const collectionRef =
            collection(
                db,
                collectionName
            );


        const snapshot =
            await getCountFromServer(
                collectionRef
            );


        return snapshot.data().count;


    } catch (error) {

        console.error(
            `Erro na coleção ${collectionName}:`,
            error
        );


        return 0;
    }

}


/* =========================================
   TERMINAR SESSÃO
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmLogout =
                confirm(
                    "Tem certeza que deseja terminar a sessão?"
                );


            if (!confirmLogout) {
                return;
            }


            try {

                await signOut(auth);


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
}


/* =========================================
   MENU MOBILE
========================================= */

function openMenu() {

    if (sidebar) {

        sidebar.classList.add("open");
    }


    if (overlay) {

        overlay.classList.add("show");
    }
}


function closeMenu() {

    if (sidebar) {

        sidebar.classList.remove("open");
    }


    if (overlay) {

        overlay.classList.remove("show");
    }
}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        openMenu
    );
}


if (overlay) {

    overlay.addEventListener(
        "click",
        closeMenu
    );
}


/* =========================================
   NAVEGAÇÃO DOS MÓDULOS
========================================= */

const moduleElements =
    document.querySelectorAll(
        "[data-module]"
    );


moduleElements.forEach(
    (element) => {

        element.addEventListener(
            "click",
            (event) => {

                const module =
                    element.dataset.module;


                /* =================================
                   MEMBROS
                ================================= */

                if (
                    module === "membros"
                ) {

                    event.preventDefault();

                    closeMenu();

                    window.location.href =
                        "membros.html";

                    return;
                }


                /* =================================
                   OUTROS MÓDULOS
                ================================= */

                event.preventDefault();

                showComingSoon(
                    module
                );

                closeMenu();

            }
        );

    }
);


/* =========================================
   MENSAGEM DOS MÓDULOS AINDA NÃO LIGADOS
========================================= */

function showComingSoon(module) {

    const names = {

        departamentos:
            "Departamentos",

        presencas:
            "Presenças",

        quotas:
            "Quotas",

        reunioes:
            "Reuniões",

        relatorios:
            "Relatórios",

        cartoes:
            "Cartões"

    };


    alert(
        `${names[module] || "Este módulo"} será desenvolvido no próximo passo.`
    );

}


/* =========================================
   SISTEMA INICIADO
========================================= */

console.log(
    "Dashboard AEP-2 iniciado."
);