// pokemon-data.js
// Dados da LuaHMoonMC
// 01.01.25 - 19h - pós charmeleon iv82

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
  Bug:      { pt:"Inseto",   c:"#A6B91A" },
  Rock:     { pt:"Pedra",    c:"#B6A136" },
  Ghost:    { pt:"Fantasma", c:"#735797" },
  Dragon:   { pt:"Dragão",   c:"#6F35FC" },
  Dark:     { pt:"Sombrio",  c:"#705746" },
  Steel:    { pt:"Aço",      c:"#B7B7CE" },
  Fairy:    { pt:"Fada",     c:"#D685AD" }
};

export const TYPE_ORDER = [
  "All","Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground",
  "Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"
];

export const RAW = [
// ACRESCENTAR ABAIXO!

  
{ name:"wartortle", iv:93, types:["Water"], xmas:true },
{ name:"golbat", iv:88, types:["Poison","Flying"] },
{ name:"wingull", iv:88, types:["Water","Flying"] },
{ name:"oshawott", iv:84, types:["Water"] },
{ name:"charmeleon", iv:82, types:["Fire"] },
  { name:"sudowoodo", iv:86, types:["Rock"] },
  { name:"spheal", iv:82, types:["Ice","Water"] },
  { name:"snom", iv:86, types:["Ice","Bug"] },
{ name:"slowpoke", iv:82, types:["Psychic"] },
  { name:"beedrill", iv:84, types:["Bug","Poison"] },
{ name:"rhydon", iv:88, types:["Ground", "Rock"] },
{ name:"ivysaur", iv:86, types:["Grass", "Poison"], xmas:true },  
{ name:"venusaur", iv:86, types:["Grass", "Poison"], xmas:true },  
  { name:"charmeleon", iv:88, types:["Fire"], xmas:true },  
{ name:"charizard", iv:86, types:["Fire"], xmas:true },  
{ name:"wingull", iv:86, types:["Water","Flying"] },
  { name:"magneton", iv:82, types:["Electric"] },  
{ name:"squirtle", iv:82, types:["Water"], xmas:true },  
  { name:"wartortle", iv:91, types:["Water"], xmas:true },  
{ name:"venonat", iv:82, types:["Bug", "Poison"] },  
  { name:"sliggoo", iv:91, types:["Dragon"] },  
  { name:"swampert", iv:86, types:["Water","Ground"] },  
  { name:"squirtle", iv:66, types:["Water"], xmas:true, shiny:true },  
  { name:"sentret", iv:93, types:["Normal"] },  
  { name:"minun", iv:88, types:["Electric"] },  
  { name:"persian", iv:91, types:["Normal"] },  
  { name:"squirtle", iv:88, types:["Water"], xmas:true },  
  { name:"blastoise", iv:91, types:["Water"], xmas:true },  
    { name:"elgyem", iv:86, types:["Psychic"] },
  { name:"pikachu", iv:93, types:["Electric"], xmas:true },
{ name:"abra", iv:95, types:["Psychic"] },
  { name:"jigglypuff", iv:66, types:["Normal","Fairy"], xmas:true, shiny:true },
{ name:"shelmet", iv:84, types:["Bug"] },  
{ name:"jigglypuff", iv:91, types:["Normal","Fairy"], xmas:true },  
  { name:"bulbasaur", iv:82, types:["Grass", "Poison"], xmas:true },  
  { name:"bellsprout", iv:82, types:["Grass", "Poison"] },
{ name:"pikachu", iv:86, types:["Electric"], xmas:true },
  { name:"pikachu", iv:62, types:["Electric"], xmas:true, shiny:true },
  
  { name:"cetitan", iv:100, types:["Ice"] },
  { name:"nidorina", iv:100, types:["Poison"] },
  { name:"cetoddle", iv:97, types:["Ice"] },
  { name:"medicham", iv:97, types:["Fighting","Psychic"] },
  { name:"wobbuffet", iv:95, types:["Psychic"] },
  { name:"sandshrew-alola", iv:94, types:["Ice","Steel"] },

  { name:"arcanine", iv:93, types:["Fire"] },
  { name:"indeedee", iv:93, types:["Psychic","Normal"] },
  { name:"wigglytuff", iv:93, types:["Normal","Fairy"] },
  { name:"leafeon", iv:93, types:["Grass"], dynamax:true },
  { name:"parasect", iv:93, types:["Bug","Grass"] },
  { name:"ekans", iv:93, types:["Poison"] },
  { name:"wingull", iv:93, types:["Water","Flying"] },

  { name:"pidgey", iv:92, types:["Normal","Flying"] },

  { name:"ekans", iv:91, types:["Poison"] },
  { name:"pumpkaboo", iv:91, types:["Ghost","Grass"] },
  { name:"yungoos", iv:91, types:["Normal"] },
  { name:"wimpod", iv:91, types:["Bug","Water"] },
  { name:"exeggutor", iv:91, types:["Grass","Psychic"] },
  { name:"makuhita", iv:91, types:["Fighting"] },
  { name:"magcargo", iv:91, types:["Fire","Rock"] },
  { name:"scyther", iv:91, types:["Bug","Flying"] },
  { name:"granbull", iv:91, types:["Fairy"] },

  { name:"scorbunny", iv:88, types:["Fire"] },
  { name:"flaaffy", iv:88, types:["Electric"] },
  { name:"charcadet", iv:88, types:["Fire"] },
  { name:"durant", iv:88, types:["Bug","Steel"] },

  { name:"electrike", iv:86, types:["Electric"] },
  { name:"glameow", iv:86, types:["Normal"] },
  { name:"slugma", iv:86, types:["Fire"] },
  { name:"muk", iv:86, types:["Poison"] },
  { name:"indeedee", iv:86, types:["Psychic","Normal"] },
  { name:"metang", iv:86, types:["Steel","Psychic"] },
  { name:"masquerain", iv:86, types:["Bug","Flying"] },
  { name:"swablu", iv:86, types:["Normal","Flying"] },
  { name:"kadabra", iv:86, types:["Psychic"] },
  { name:"meditite", iv:86, types:["Fighting","Psychic"] },
  { name:"lechonk", iv:86, types:["Normal"] },
    { name:"kirlia", iv:86, types:["Psychic","Fairy"] },

  { name:"grovyle", iv:82, types:["Grass"] },
  { name:"miltank", iv:82, types:["Normal"] },
  { name:"snorlax", iv:82, types:["Normal"] },
  { name:"beartic", iv:82, types:["Ice"] },
  { name:"weezing", iv:82, types:["Poison"] },
  { name:"dusclops", iv:82, types:["Ghost"] },
  { name:"electabuzz", iv:82, types:["Electric"] },
  { name:"gothorita", iv:82, types:["Psychic"] },
  { name:"gastly", iv:82, types:["Ghost","Poison"] },
  { name:"tinkatuff", iv:82, types:["Fairy","Steel"] },
  { name:"lunatone", iv:82, types:["Rock","Psychic"] },

  { name:"hitmontop", iv:84, types:["Fighting"] },
  { name:"grookey", iv:84, types:["Grass"] },
  { name:"bulbasaur", iv:84, types:["Grass","Poison"] },
  { name:"herdier", iv:84, types:["Normal"] },
  { name:"porygon", iv:84, types:["Normal"] },
  { name:"skiploom", iv:84, types:["Grass","Flying"] },
  { name:"petilil", iv:84, types:["Grass"] },
  { name:"liepard", iv:84, types:["Dark"] },
  { name:"claydol", iv:84, types:["Ground","Psychic"] },
  { name:"hippopotas", iv:84, types:["Ground"] },
  { name:"igglybuff", iv:84, types:["Normal","Fairy"] },
  { name:"jynx", iv:84, types:["Ice","Psychic"] },
  { name:"crocalor", iv:84, types:["Fire"] },
  { name:"haunter", iv:84, types:["Ghost","Poison"] },
  { name:"clamperl", iv:84, types:["Water"] },

  { name:"smoliv", iv:80, types:["Grass","Normal"] },
  { name:"ralts", iv:80, types:["Psychic","Fairy"] },
  { name:"munna", iv:80, types:["Psychic"] },

  { name:"gastly", iv:77, types:["Ghost","Poison"], shiny:true },
  { name:"omanyte", iv:77, types:["Rock","Water"], dynamax:true },
  { name:"chansey", iv:77, types:["Normal"], dynamax:true },
  { name:"larvitar", iv:77, types:["Rock","Ground"] },
{ name:"krabby", iv:80, types:["Water"], dynamax:true },
    { name:"krabby", iv:75, types:["Water"], dynamax:true },
  { name:"doublade", iv:75, types:["Steel","Ghost"] },

  { name:"ditto", iv:73, types:["Normal"] },

  { name:"glalie", iv:84, types:["Ice"] },
  { name:"throh", iv:51, types:["Fighting"] }
];

export const GYM_STATS = {
  gymsDefeated: 116,        // quantos ginásios você já derrotou
  hoursLeading: 187       // total em horas liderando ginásios
};

export const META = {
  lastUpdated: "2026-01-01" // YYYY-MM-DD (ou a data que você quiser)
};
