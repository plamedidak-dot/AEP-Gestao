/* =========================================
   LOGIN AEP-2
   Firebase Authentication
========================================= */

import {
    auth
} from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/* =========================================
   ELEMENTOS
========================================= */

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const rememberMe =
    document.getElementById("rememberMe");

const loginButton =
    document.getElementById("loginButton");

const buttonText =
    document.getElementById("buttonText");

const loading =
    document.getElementById("loading");

const message =
    document.getElementById("message");

const togglePassword =
    document.getElementById("togglePassword");

const forgotPassword =
    document.getElementById("forgotPassword");


/* =========================================
   FUNÇÃO PARA MOSTRAR MENSAGENS
========================================= */

function showMessage(text, type = "error") {

    message.textContent = text;

    message.className =
        `message ${type}`;
}


/* =========================================
   LIMPAR MENSAGEM
========================================= */

function clearMessage() {

    message.textContent = "";

    message.className = "message";
}


/* =========================================
   ESTADO DE CARREGAMENTO
========================================= */

function setLoading(isLoading) {

    loginButton.disabled = isLoading;

    if (isLoading) {

        loginButton.classList.add(
            "loading-button"
        );

    } else {

        loginButton.classList.remove(
            "loading-button"
        );

    }
}


/* =========================================
   MOSTRAR / OCULTAR PASSWORD
========================================= */

togglePassword.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword
                ? "text"
                : "password";

        togglePassword.innerHTML =
            isPassword
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';

        togglePassword.setAttribute(
            "aria-label",
            isPassword
                ? "Ocultar palavra-passe"
                : "Mostrar palavra-passe"
        );

    }
);


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessage();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        /* ------------------------------
           VALIDAÇÃO
        ------------------------------ */

        if (!email) {

            showMessage(
                "Digite o seu e-mail."
            );

            emailInput.focus();

            return;
        }


        if (!password) {

            showMessage(
                "Digite a sua palavra-passe."
            );

            passwordInput.focus();

            return;
        }


        /* ------------------------------
           LOADING
        ------------------------------ */

        setLoading(true);


        try {

            /* ------------------------------
               DEFINIR PERSISTÊNCIA
            ------------------------------ */

            await setPersistence(
                auth,
                rememberMe.checked
                    ? browserLocalPersistence
                    : browserSessionPersistence
            );


            /* ------------------------------
               AUTENTICAR
            ------------------------------ */

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            console.log(
                "Utilizador autenticado:",
                user.uid
            );


            showMessage(
                "Login realizado com sucesso. A entrar...",
                "success"
            );


            /* ------------------------------
               REDIRECIONAR
            ------------------------------ */

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);


        } catch (error) {

            console.error(
                "Erro no login:",
                error
            );


            let errorMessage =
                "Não foi possível iniciar sessão.";


            switch (error.code) {

                case "auth/invalid-credential":

                    errorMessage =
                        "E-mail ou palavra-passe incorretos.";

                    break;


                case "auth/user-not-found":

                    errorMessage =
                        "Não existe uma conta com este e-mail.";

                    break;


                case "auth/wrong-password":

                    errorMessage =
                        "A palavra-passe está incorreta.";

                    break;


                case "auth/invalid-email":

                    errorMessage =
                        "Digite um e-mail válido.";

                    break;


                case "auth/user-disabled":

                    errorMessage =
                        "Esta conta foi desativada.";

                    break;


                case "auth/too-many-requests":

                    errorMessage =
                        "Muitas tentativas. Tente novamente mais tarde.";

                    break;


                case "auth/network-request-failed":

                    errorMessage =
                        "Erro de ligação. Verifique a Internet.";

                    break;


                default:

                    errorMessage =
                        "Ocorreu um erro ao iniciar sessão.";

            }


            showMessage(
                errorMessage,
                "error"
            );

        } finally {

            setLoading(false);

        }

    }
);


/* =========================================
   RECUPERAR PALAVRA-PASSE
========================================= */

forgotPassword.addEventListener(
    "click",
    async () => {

        clearMessage();

        const email =
            emailInput.value.trim();


        if (!email) {

            showMessage(
                "Digite primeiro o seu e-mail para recuperar a palavra-passe."
            );

            emailInput.focus();

            return;
        }


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );


            showMessage(
                "Enviámos um link de recuperação para o seu e-mail.",
                "success"
            );


        } catch (error) {

            console.error(
                "Erro na recuperação:",
                error
            );


            let errorMessage =
                "Não foi possível enviar o link de recuperação.";


            if (
                error.code ===
                "auth/user-not-found"
            ) {

                errorMessage =
                    "Não existe uma conta com este e-mail.";

            }


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                errorMessage =
                    "Digite um e-mail válido.";

            }


            showMessage(
                errorMessage
            );

        }

    }
);


/* =========================================
   VERIFICAR SE JÁ ESTÁ AUTENTICADO
========================================= */

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "Utilizador já autenticado:",
                user.email
            );


            /*
             * Se já estiver autenticado,
             * não precisa fazer login novamente.
             */

            window.location.href =
                "dashboard.html";
        }

    }
);


/* =========================================
   FIM
========================================= */

console.log(
    "Sistema de Login AEP-2 iniciado."
);