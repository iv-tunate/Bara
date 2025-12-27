let baseUrl = "";
let clientUrl = "";
//const env = "local";
const env: string = "dev";
//-------------------------------------------------
if (env === "local") {
  baseUrl = "http://localhost:5001";
  clientUrl = "http://localhost:5173";
} else if (env === "dev") {
  baseUrl = "https://examinator-backend-dev.onrender.com";
  clientUrl = "https://examinatorr.netlify.app";
}

export { baseUrl, clientUrl };
