(function installSoundStormContactForm(root) {
    "use strict";

    var form = document.getElementById("soundstorm-contact-form");
    if (!form) {
        return;
    }
    var email = document.getElementById("soundstorm-contact-email");
    var message = document.getElementById("soundstorm-contact-message");
    var website = document.getElementById("soundstorm-contact-website");
    var button = document.getElementById("soundstorm-contact-send");
    var status = document.getElementById("soundstorm-contact-status");
    var endpoint = form.action;
    var ticket = null;
    var ticketRequest = null;
    var sending = false;

    function showStatus(text, state) {
        status.textContent = text;
        status.dataset.state = state;
    }

    async function requestJson(options) {
        var controller = new AbortController();
        var timeout = root.setTimeout(function abortSlowRequest() {
            controller.abort();
        }, 15000);
        try {
            var response = await root.fetch(endpoint, Object.assign({
                credentials: "omit",
                cache: "no-store",
                signal: controller.signal,
            }, options));
            var data = await response.json();
            if (!response.ok || data.ok !== true) {
                if (response.status === 403) {
                    ticket = null;
                }
                throw new Error(data.error || "Your message could not be sent. Please try again later.");
            }
            return data;
        }
        catch (error) {
            if (error instanceof TypeError || error.name === "AbortError" || error instanceof SyntaxError) {
                throw new Error("Unable to reach the contact form. Please try again or open the contact page below.");
            }
            throw error;
        }
        finally {
            root.clearTimeout(timeout);
        }
    }

    function prepareTicket() {
        if (ticket && ticket.expiresAt > Date.now() + 5000) {
            return Promise.resolve(ticket);
        }
        if (!ticketRequest) {
            ticketRequest = requestJson({method: "GET"}).then(function rememberTicket(data) {
                if (typeof data.token !== "string" || !data.token) {
                    throw new Error("The contact form is unavailable. Please try again later.");
                }
                ticket = {
                    value: data.token,
                    readyAt: Date.now() + 1100,
                    expiresAt: Date.now() + Math.min(900, Number(data.expiresIn) || 900) * 1000,
                };
                return ticket;
            }).finally(function clearTicketRequest() {
                ticketRequest = null;
            });
        }
        return ticketRequest;
    }

    form.addEventListener("focusin", function preloadContactTicket() {
        prepareTicket().catch(function deferContactErrorUntilSubmit() {});
    });
    // Typing Return, P or a movement key must not trigger fullscreen or leave
    // gameplay inputs held down when the user later presses PLAY.
    ["keydown", "keyup"].forEach(function isolateKeyboardInput(type) {
        form.addEventListener(type, function keepTypingInsideForm(event) {
            event.stopPropagation();
        });
    });

    form.addEventListener("submit", async function submitContactMessage(event) {
        event.preventDefault();
        if (sending || !form.reportValidity()) {
            return;
        }
        sending = true;
        button.disabled = true;
        button.textContent = "Sending…";
        form.setAttribute("aria-busy", "true");
        email.readOnly = true;
        message.readOnly = true;
        showStatus("Sending your message…", "sending");
        try {
            var currentTicket = await prepareTicket();
            var delay = Math.max(0, currentTicket.readyAt - Date.now());
            if (delay) {
                await new Promise(function waitForTicketAge(resolve) {
                    root.setTimeout(resolve, delay);
                });
            }
            await requestJson({
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: email.value.trim(),
                    message: message.value.trim(),
                    website: website.value,
                    token: currentTicket.value,
                }),
            });
            ticket = null;
            form.reset();
            showStatus("Thank you! Your message has been sent to Damian.", "success");
        }
        catch (error) {
            showStatus(error.message, "error");
        }
        finally {
            sending = false;
            button.disabled = false;
            button.textContent = "Send message";
            form.removeAttribute("aria-busy");
            email.readOnly = false;
            message.readOnly = false;
        }
    });
})(window);
