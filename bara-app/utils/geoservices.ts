import cache from "./cache";
const BASE_URL = "https://countriesnow.space/api/v0.1/countries";

export async function getCountries() {
    return cache("countries", async () => {
      const res = await fetch(`${BASE_URL}`);
      const data = await res.json();
      return data.data.map((c: any) => c.country);
    });
}

export async function getStates(country: string) {
    return cache(`states:${country}`, async () => {
      const res = await fetch(`${BASE_URL}/states`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
      const data = await res.json();
      return data.data.states.map((s: any) => s.name);
    });
}

export async function getCities(country: string, state: string) {
    return cache(`cities:${country}:${state}`, async () => {
      const res = await fetch(`${BASE_URL}/state/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, state }),
      });
      const data = await res.json();
      return data.data;
    });
}
