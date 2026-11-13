
// ---------- Data ----------
const account = {
  name: "Ali Khan",
  pin: "1234",
  balance: 5000,
  history: [],
};
 
let tries = 0;
const MAX_TRIES = 3;
 
const screen = document.getElementById("screen");
 
// ---------- Helper functions ----------
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
 
function button(label, onClick, extraClass = "") {
  const b = el("button", ("btn " + extraClass).trim(), label);
  b.addEventListener("click", onClick);
  return b;
}
 
function render(...nodes) {
  screen.replaceChildren(...nodes);
}
 
function money(n) {
  return "Rs. " + n.toLocaleString("en-PK");
}
 
function addHistory(type, amount) {
  account.history.unshift({
    type,
    amount,
    balance: account.balance,
    time: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }),
  });
}
 
// ---------- Screens ----------
function showLogin(message = "", isError = false) {
  const input = el("input", "input");
  input.type = "password";
  input.maxLength = 4;
  input.inputMode = "numeric";
  input.placeholder = "****";
 
  const msg = el("p", isError ? "msg error" : "msg", message);
 
  function submit() {
    if (input.value === account.pin) {
      tries = 0;
      showMenu();
      return;
    }
    tries++;
    if (tries >= MAX_TRIES) {
      showLocked();
    } else {
      showLogin(`Wrong PIN. ${MAX_TRIES - tries} attempts left.`, true);
    }
  }
 
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
 
  render(
    el("h2", null, "Welcome"),
    el("p", "hint", "Enter your 4-digit PIN"),
    input,
    msg,
    button("Enter", submit)
  );
  input.focus();
}
 
function showLocked() {
  tries = 0;
  render(
    el("h2", null, "Card Blocked"),
    el("p", "msg error", "Wrong PIN entered 3 times. Your card has been blocked."),
    button("Start Over", () => showLogin(), "secondary")
  );
}
 
function showMenu() {
  const menu = el("div", "menu");
  menu.append(
    button("Balance", showBalance),
    button("Deposit", () => showAmount("deposit")),
    button("Withdraw", () => showAmount("withdraw")),
    button("Statement", showStatement),
    button("Change PIN", showChangePin, "wide")
  );
 
  render(
    el("h2", null, `Hello, ${account.name}`),
    el("p", "hint", "Choose an option"),
    menu,
    button("Logout", () => showLogin("Thank you! See you again."), "danger")
  );
}
 
function showBalance() {
  render(
    el("h2", null, "Your Balance"),
    el("p", "balance", money(account.balance)),
    button("Back to Menu", showMenu)
  );
}
 
function showAmount(type) {
  const isDeposit = type === "deposit";
 
  const input = el("input", "input");
  input.type = "number";
  input.min = "1";
  input.placeholder = "Enter amount";
 
  const msg = el("p", "msg");
 
  function submit() {
    const amount = Number(input.value);
 
    if (!amount || amount <= 0) {
      msg.className = "msg error";
      msg.textContent = "Enter a valid amount.";
      return;
    }
    if (!isDeposit && amount > account.balance) {
      msg.className = "msg error";
      msg.textContent = "Insufficient balance.";
      return;
    }
 
    account.balance += isDeposit ? amount : -amount;
    addHistory(type, amount);
    showSuccess(type, amount);
  }
 
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
 
  const quick = el("div", "quick");
  [500, 1000, 5000].forEach((value) => {
    quick.append(
      button(String(value), () => {
        input.value = value;
        input.focus();
      }, "secondary")
    );
  });
 
  render(
    el("h2", null, isDeposit ? "Deposit Money" : "Withdraw Money"),
    quick,
    input,
    msg,
    button(isDeposit ? "Deposit" : "Withdraw", submit),
    button("Back to Menu", showMenu, "secondary")
  );
  input.focus();
}
 
function showSuccess(type, amount) {
  const verb = type === "deposit" ? "deposited" : "withdrawn";
  render(
    el("h2", null, "Success!"),
    el("p", "msg", `${money(amount)} ${verb}.`),
    el("p", "hint", "New balance:"),
    el("p", "balance", money(account.balance)),
    button("Back to Menu", showMenu)
  );
}
 
function showStatement() {
  const list = el("ul", "history");
 
  if (account.history.length === 0) {
    list.append(el("li", null, "No transactions yet."));
  } else {
    account.history.slice(0, 5).forEach((t) => {
      const li = el("li", t.type);
      const sign = t.type === "deposit" ? "+" : "-";
      li.append(
        el("span", null, `${t.time}  ${t.type}`),
        el("span", null, `${sign}${money(t.amount)}`)
      );
      list.append(li);
    });
  }
 
  render(
    el("h2", null, "Mini Statement"),
    el("p", "hint", "Last 5 transactions"),
    list,
    button("Back to Menu", showMenu)
  );
}
 
function showChangePin() {
  function pinInput(placeholder) {
    const input = el("input", "input");
    input.type = "password";
    input.maxLength = 4;
    input.inputMode = "numeric";
    input.placeholder = placeholder;
    return input;
  }
 
  const oldPin = pinInput("Current PIN");
  const newPin = pinInput("New PIN");
  const confirmPin = pinInput("Confirm new PIN");
  const msg = el("p", "msg");
 
  function showError(text) {
    msg.className = "msg error";
    msg.textContent = text;
  }
 
  function submit() {
    if (oldPin.value !== account.pin) {
      showError("Current PIN is incorrect.");
      return;
    }
    if (!/^\d{4}$/.test(newPin.value)) {
      showError("New PIN must be exactly 4 digits.");
      return;
    }
    if (newPin.value === account.pin) {
      showError("New PIN must be different from the current one.");
      return;
    }
    if (newPin.value !== confirmPin.value) {
      showError("The new PINs do not match.");
      return;
    }
 
    account.pin = newPin.value;
    render(
      el("h2", null, "PIN Changed!"),
      el("p", "msg", "Your new PIN has been set."),
      button("Back to Menu", showMenu)
    );
  }
 
  confirmPin.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
 
  render(
    el("h2", null, "Change PIN"),
    oldPin,
    newPin,
    confirmPin,
    msg,
    button("Update PIN", submit),
    button("Back to Menu", showMenu, "secondary")
  );
  oldPin.focus();
}
 
// ---------- Start ----------
showLogin();
