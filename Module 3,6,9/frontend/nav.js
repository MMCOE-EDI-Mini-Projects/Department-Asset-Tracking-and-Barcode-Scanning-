function renderNav(active) {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const pages = [["index.html","Dashboard"],["register.html","Register"],["identify.html","Identify"],["disposal.html","Disposal Requests"],["reports.html","Reports"]];
  const links = pages.map(([href,label]) => `<a href="${href}"${active===href?' style="text-decoration:underline"':''}>${label}</a>`).join("");
  const authLink = token
    ? `<a href="#" onclick="localStorage.clear();location.href='login.html';return false;">Logout (${userName})</a>`
    : `<a href="login.html">Login</a>`;
  document.getElementById("nav").innerHTML = `
    <span class="navbar-title">Department Asset Tracking</span>
    <div class="navbar-links">${links}${authLink}</div>`;
}
