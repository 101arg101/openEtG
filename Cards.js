"use strict";
exports.Codes = [];
exports.Targeting = null;
exports.loadcards = function(){
	require("./Cards.json").forEach(function(cards, type){
		if (type == 6) parseTargeting(cards);
		else parseCsv(type, cards);
	});
}
exports.codeCmp = function(x, y){
	var cx = exports.Codes[etgutil.asShiny(x, false)], cy = exports.Codes[etgutil.asShiny(y, false)];
	return cx.upped - cy.upped || cx.element - cy.element || cx.cost - cy.cost || cx.type - cy.type || (cx.code > cy.code) - (cx.code < cy.code) || (x > y) - (x < y);
}
exports.cardCmp = function(x, y){
	return exports.codeCmp(x.code, y.code);
}
var filtercache = [];
exports.filter = function(upped, filter, cmp, showshiny){
	var cacheidx = (upped?1:0)|(showshiny?2:0);
	if (!(cacheidx in filtercache)){
		filtercache[cacheidx] = [];
		for (var key in exports.Codes){
			var card = exports.Codes[key];
			if (card.upped == upped && !card.shiny == !showshiny && !card.status.get("token")){
				filtercache[cacheidx].push(card);
			}
		}
		filtercache[cacheidx].sort();
	}
	var keys = filtercache[cacheidx].filter(filter);
	if (cmp) keys.sort(cmp);
	return keys;
}
function parseCsv(type, data){
	var keys = data[0], cardinfo = {};
	for(var i=1; i<data.length; i++){
		cardinfo.E = i-1;
		data[i].forEach(function(carddata){
			keys.forEach(function(key, i){
				cardinfo[key] = carddata[i];
			});
			var cardcode = cardinfo.Code;
			if (cardcode in exports.Codes){
				console.log(cardcode + " duplicate " + cardinfo.Name + " " + exports.Codes[cardcode].name);
			}else{
				exports.Codes[cardcode] = new Card(type, cardinfo);
				if (cardcode < 7000) exports[cardinfo.Name.replace(/\W/g, "")] = exports.Codes[cardcode];
				cardinfo.Code = etgutil.asShiny(cardcode, true);
				exports.Codes[cardinfo.Code] = new Card(type, cardinfo);
			}
		});
	}
}
function parseTargeting(data){
	for(var key in data){
		data[key] = getTargetFilter(data[key]);
	}
	exports.Targeting = data;
}
function getTargetFilter(str){
	function getFilterFunc(funcname){ return TargetFilters[funcname]; }
	if (str in TargetFilters){
		return TargetFilters[str];
	}else{
		var splitIdx = str.lastIndexOf(":");
		var prefixes = ~splitIdx ? str.substr(0, splitIdx).split(":").map(getFilterFunc) : [],
			filters = (~splitIdx ? str.substr(splitIdx+1) : str).split("+").map(getFilterFunc);
		return TargetFilters[str] = function(c, t){
			function check(f){ return f(c, t); }
			return prefixes.every(check) && filters.some(check);
		}
	}
}
var TargetFilters = {
	own:function(c, t){
		return c.owner == t.owner;
	},
	foe:function(c, t){
		return c.owner != t.owner
	},
	notself:function(c, t){
		return c != t;
	},
	all:function(c, t){
		return true;
	},
	card:function(c, t){
		return c != t && t.type == etg.Spell;
	},
	pill:function(c, t){
		return t.isMaterial(etg.Permanent) && t.card.type == etg.Pillar;
	},
	weap:function(c, t){
		return (t.type == etg.Weapon || (t.type < etg.Spell && t.card.type == etg.Weapon)) && !t.status.get("immaterial") && !t.status.get("burrowed");
	},
	shie:function(c, t){
		return (t.type == etg.Shield || (t.type < etg.Spell && t.card.type == etg.Shield)) && !t.status.get("immaterial") && !t.status.get("burrowed");
	},
	playerweap:function(c,t){
		return t.type == etg.Weapon;
	},
	perm:function(c, t){
		return t.isMaterial(etg.Permanent);
	},
	permnonstack:function(c,t){
		return t.isMaterial(etg.Permanent) && !t.status.get("stackable");
	},
	stack:function(c,t){
		return t.isMaterial(etg.Permanent) && t.status.get("stackable");
	},
	crea:function(c, t){
		return t.isMaterial(etg.Creature);
	},
	play:function(c, t){
		return t.type == etg.Player;
	},
	notplay:function(c, t){
		return t.type != etg.Player;
	},
	sing:function(c, t){
		return t.isMaterial(etg.Creature) && t.active.cast != c.active.cast;
	},
	notskele:function(c, t){
		return t.isMaterial(etg.Creature) && !t.card.isOf(exports.Skeleton);
	},
	butterfly:function(c, t){
		return (t.type == etg.Creature || t.type == etg.Weapon) && !t.status.get("immaterial") && !t.status.get("burrowed") && (t.trueatk()<3 || (t.type == etg.Creature && t.truehp()<3));
	},
	devour:function(c, t){
		return t.isMaterial(etg.Creature) && t.truehp()<c.truehp();
	},
	paradox:function(c, t){
		return t.isMaterial(etg.Creature) && t.truehp()<t.trueatk();
	},
	forceplay:function(c, t){
		return t.type == etg.Spell || (t.isMaterial() && t.active.cast);
	},
	airbornecrea:function(c, t){
		return t.isMaterial(etg.Creature) && t.status.get("airborne");
	},
	golem:function(c, t){
		return t.status.get("golem") && t.attack;
	},
	groundcrea:function(c, t){
		return t.isMaterial(etg.Creature) && !t.status.get("airborne");
	},
	wisdom:function(c, t){
		return (t.type == etg.Creature || t.type == etg.Weapon) && !t.status.get("burrowed");
	},
	quinttog:function(c, t){
		return t.type == etg.Creature && !t.status.get("burrowed");
	},
};
var etg = require("./etg");
var Card = require("./Card");
var etgutil = require("./etgutil");