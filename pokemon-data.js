// pokemon-data.js
// Dados da LuaHMoonMC

export const TYPE = {
  Normal:   { pt:"Normal",   c:"#A8A77A" },
  Fire:     { pt:"Fogo",     c:"#EE8130" },
  Water:    { pt:"Água",     c:"#6390F0" },
  Electric: { pt:"Elétrico", c:"#F7D02C" },
  Grass:    { pt:"Planta",   c:"#7AC74C" },
  Ice:      { pt:"Gelo",     c:"#96D9D6" },
  Fighting: { pt:"Lutador",  c:"#C22E28" },
  Poison:   { pt:"Venenoso", c:"#A33EA1" },
  Ground:   { pt:"Terra",    c:"#E2BF65" },
  Flying:   { pt:"Voador",   c:"#A98FF3" },
  Psychic:  { pt:"Psíquico", c:"#F95587" },
  Bug:      { pt:"Inseto",    c:"#A6B91A" },
  Rock:     { pt:"Pedra",     c:"#B6A136" },
  Ghost:    { pt:"Fantasma",  c:"#735797" },
  Dragon:   { pt:"Dragão",    c:"#6F35FC" },
  Dark:     { pt:"Sombrio",   c:"#705746" },
  Steel:    { pt:"Aço",       c:"#B7B7CE" },
  Fairy:    { pt:"Fada",      c:"#D685AD" }
};

export const TYPE_ORDER = [
  "All","Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground",
  "Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"
];

export const RAW = [
  { name:"breloom", iv:100, types:["Grass","Fighting"] },
  { name:"scrafty", iv:100, types:["Dark","Fighting"] },
  { name:"mewtwo", iv:100, types:["Psychic"] },
  { name:"octillery", iv:100, types:["Water"] },
  { name:"incineroar", iv:100, types:["Fire","Dark"] },
  { name:"lapras", iv:100, types:["Water","Ice"] },
  { name:"lillipup", iv:53, types:["Normal"], shiny:true },
  { name:"jirachi", iv:82, types:["Steel","Psychic"] },
  { name:"azumarill", iv:91, types:["Water","Fairy"] },
  { name:"araquanid", iv:95, types:["Water","Bug"] },
  { name:"starmie", iv:100, types:["Water","Psychic"], favorite:true },
  { name:"tentacruel", iv:100, types:["Water","Poison"] },
  { name:"eevee", iv:86, types:["Normal"], dynamax:true },
  { name:"huntail", iv:100, types:["Water"] },
  { name:"gyarados", iv:100, types:["Water","Flying"] },
  { name:"mawile", iv:100, types:["Steel","Fairy"] },
  { name:"emolga", iv:100, types:["Electric","Flying"] },
  { name:"gyarados", iv:100, types:["Water","Flying"], favorite:true, shiny:true },
  { name:"toxicroak", iv:100, types:["Poison","Fighting"] },
  { name:"feebas", iv:100, types:["Water"] },
  { name:"kingler", iv:100, types:["Water"], favorite:true },
];

const HOURS_LEADING_SINCE = new Date(2025, 11, 28, 12, 0, 0); // 28/12/2025 12:00

export const GYM_STATS = {
  gymsDefeated: 2058,
  get hoursLeading(){
    const ms = Date.now() - HOURS_LEADING_SINCE.getTime();
    return Math.max(0, Math.floor(ms / 36e5));
  }
};

export const META = {
  lastUpdated: "2026-08-23"
};