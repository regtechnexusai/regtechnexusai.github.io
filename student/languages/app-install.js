(function () {
  var button = document.getElementById("install-language-app");
  var message = document.getElementById("install-language-message");
  if (!button || !message) return;
  var pending = null;
  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    pending = event;
    button.hidden = false;
    message.textContent = "Install the Language Learning Hub for quick home-screen access.";
  });
  button.addEventListener("click", async function () {
    if (!pending) {
      message.textContent = "Open your browser menu and choose Install app or Add to Home screen.";
      return;
    }
    var promptEvent = pending;
    pending = null;
    button.disabled = true;
    try {
      await promptEvent.prompt();
      var choice = await promptEvent.userChoice;
      message.textContent = choice && choice.outcome === "accepted"
        ? "Installation accepted. Look for Language Hub on your home screen."
        : "Installation was not completed. You can try again from your browser menu.";
    } catch (error) {
      message.textContent = "Use your browser menu to add this site to your home screen.";
    }
    button.disabled = false;
    button.hidden = true;
  });
  window.addEventListener("appinstalled", function () {
    button.hidden = true;
    message.textContent = "Language Learning Hub has been installed.";
  });
})();