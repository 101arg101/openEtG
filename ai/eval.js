"use strict";
var etg = require("../etg");
var Cards = require("../Cards");
var Skills = require("../Skills");
var parseSkill = require("../parseSkill");
var enableLogging = false, logbuff, logstack;
function logStart(){
	if (enableLogging){
		logbuff = {};
		logstack = [];
	}
}
function logEnd(){
	if (enableLogging){
		console.log(logbuff);
		logstack = logbuff = undefined;
	}
}
function logNest(x){
	if (enableLogging){
		logstack.push(logbuff);
		logbuff = logbuff[x] = {};
	}
}
function logNestEnd(x){
	if (enableLogging){
		logbuff = logstack.pop();
	}
}
function log(x, y){
	if (enableLogging){
		if (!(x in logbuff)){
			logbuff[x] = y;
		}else if (logbuff[x] instanceof Array){
			logbuff[x].push(y);
		}else{
			logbuff[x] = [logbuff[x], y];
		}
	}
}
function pillarval(c){
	return c.type == etg.Spell?.1:Math.sqrt(c.status.get("charges"));
}
var SkillsValues = Object.freeze({
	ablaze:3,
	accelerationspell:5,
	acceleration:function(c){
		return c.truehp()-2;
	},
	accretion:8,
	adrenaline:8,
	aflatoxin:5,
	aggroskele:2,
	air:1,
	alphawolf:function(c){
		return c.type == etg.Spell?3:0;
	},
	animateweapon:4,
	antimatter:12,
	appease:function(c){
		return c.type == etg.Spell?-6:c.status.get("appeased")?0:c.trueatk()*-1.5;
	},
	bblood:7,
	beguilestop:function(c){
		return -getDamage(c);
	},
	bellweb:1,
	blackhole:function(c){
		var a=0, fq=c.owner.foe.quanta;
		for(var i=1; i<13; i++){
			a += Math.min(fq[i], 3)/3;
		}
		return a;
	},
	bless:4,
	boneyard:3,
	bounce:function(c){
		return c.card.cost+(c.card.upped?1:0);
	},
	bravery:3,
	brawl:8,
	brew:4,
	brokenmirror:function(c){
		return c.owner.foe.shield && c.owner.foe.shield.status.get("reflective") ? -3 : 2;
	},
	burrow:1,
	butterfly:12,
	catapult:6,
	chimera:4,
	chromastat:function(c){
		return 1+(c.type == etg.Spell ? c.card.health+c.card.attack : c.trueatk() + c.truehp())/3;
	},
	clear:2,
	corpseexplosion:1,
	counter:3,
	countimmbur:1,
	cpower:4,
	cseed:4,
	cseed2:4,
	creatureupkeep:function(c){
		return c.owner.foe.countcreatures()-c.owner.countcreatures()/2;
	},
	darkness:1,
	deadalive:2,
	deathwish:1,
	deckblast:function(c){
		return c.owner.deck.length/2;
	},
	deepdive:function(c, ttatk){
		return c.type == etg.Spell?c.card.attack:ttatk/1.5;
	},
	deepdiveproc:function(c, ttatk){
		return c.type == etg.Spell?c.card.attack:ttatk;
	},
	deja:4,
	deployblobs:function(c){
		return 2+(c.type == etg.Spell ? Math.min(c.card.attack, c.card.health) : Math.min(c.trueatk(), c.truehp()))/4;
	},
	destroy:8,
	destroycard:1,
	devour:function(c){
		return 2+(c.type == etg.Spell?c.card.health:c.truehp());
	},
	disarm:function(c){
		return !c.owner.foe.weapon ? .1 : c.owner.foe.hand.length == 8 ? .5 : c.owner.foe.weapon.card.cost;
	},
	disfield:8,
	disshield:7,
	dive:function(c, ttatk){
		return c.type == etg.Spell?c.card.attack:ttatk-c.status.get("dive")/1.5;
	},
	divinity:3,
	drainlife:10,
	draft:1,
	drawcopy:1,
	drawequip:2,
	drawpillar:1,
	dryspell:5,
	dshield:4,
	duality:4,
	earth:1,
	earthquake:4,
	eatspell:3,
	embezzle:7,
	empathy:function(c){
		return c.owner.countcreatures();
	},
	enchant:6,
	endow:4,
	envenom:3,
	epidemic:4,
	epoch:2,
	evolve:2,
	feed:6,
	fickle:3,
	fire:1,
	firebolt:10,
	flatline:1,
	flyingweapon:7,
	foedraw:8,
	forcedraw:-10,
	forceplay:2,
	fractal:function(c){
		return 9-c.owner.hand.length;
	},
	freeze:[3,3.5],
	freezeperm:[3.5,4],
	fungusrebirth:1,
	gas:5,
	give:1,
	golemhit:function(c){
		var dmg = 0;
		for(var i=0; i<23; i++){
			var cr = c.owner.creatures[i];
			if (cr && cr.status.get("golem") && !cr.status.get("delayed") && !cr.status.get("frozen")){
				var atk = getDamage(cr);
				if (atk > dmg) dmg = atk;
			}
		}
		return dmg;
	},
	gpull:function(c){
		return c.type == etg.Spell || c != c.owner.gpull ? 2 : 0;
	},
	gpullspell:3,
	gratitude:4,
	grave:1,
	"growth 1":3,
	"growth 2":5,
	guard:4,
	halveatk:function(c){
		var atk;
		return c.type == etg.Spell ? -c.card.attack/4 : ((atk = c.trueatk()) < 0)-(atk > 0);
	},
	hasten:function(c){
		return Math.min(c.owner.deck.length/4, 10);
	},
	hatch:3,
	heal:8,
	heatmirror:2,
	hitownertwice:function(c){
		return (c.type == etg.Spell ? c.card.attack : c.trueatk())*-2;
	},
	holylight:3,
	hope:2,
	icebolt:10,
	ignite:4,
	immolate:5,
	improve:6,
	inertia:2,
	infect:4,
	ink:3,
	innovation:3,
	integrity:4,
	jelly:5,
	jetstream:2.5,
	light:1,
	lightning:7,
	liquid:5,
	livingweapon:2,
	lobotomize:6,
	loot:2,
	luciferin:3,
	lycanthropy:4,
	mend:3,
	metamorph: 2,
	midas:6,
	millpillar:1,
	mimic:3,
	miracle:function(c){
		return c.owner.maxhp/8;
	},
	mitosis:function(c){
		return 4+c.card.cost;
	},
	mitosisspell:6,
	momentum:2,
	mutation:4,
	neuro:function(c) {
		return c.owner.foe.status.get("neuro")?evalactive(c, parseSkill("poison 1"))+.1:6;
	},
	neuroify:function(c) {
		return c.owner.foe.status.get("neuro")?1:5;
	},
	nightmare:function(c){
		var n = 0;
		c.owner.hand.forEach(function(inst){
			if (inst.card.isOf(Cards.Nightmare)) n++;
		});
		return (24-c.owner.foe.hand.length) >> n;
	},
	nightshade:6,
	nova:4,
	nova2:6,
	nullspell:4,
	nymph:7,
	ouija:3,
	overdrive:function(c){
		return c.truehp()-1;
	},
	overdrivespell:5,
	pacify:5,
	pairproduce:2,
	paleomagnetism:[4,5],
	pandemonium:3,
	pandemonium2:4,
	pandemonium3:5,
	paradox:5,
	parallel:8,
	phoenix:3,
	photosynthesis:2,
	plague:5,
	platearmor:1,
	poisonfoe:1.4,
	"poison 1":2,
	"poison 2":3,
	"poison 3":4,
	powerdrain:6,
	precognition:1,
	predator:function(c, tatk){
		return c.type != etg.Spell && c.owner.foe.hand.length > 4 ? tatk + Math.max(c.owner.foe.hand.length-6, 1) : 1;
	},
	protectonce:2,
	protectall:4,
	purify:2,
	quint:6,
	quinttog:7,
	rage:[5, 6],
	readiness: 3,
	reap:7,
	rebirth:[5, 2],
	reducemaxhp: function(c, ttatk){
		return (ttatk == undefined ? c.card.attack : ttatk)*5/3;
	},
	regenerate: 5,
	regeneratespell: 5,
	regrade:3,
	reinforce:.5,
	ren:5,
	retain:6,
	rewind:6,
	ricochet:2,
	sadism:5,
	salvage:2,
	sanctuary:6,
	scramble:function(c){
		var a=0, fq=c.owner.foe.quanta;
		for(var i=1; i<13; i++){
			if (!fq[i])a++;
		}
		return a;
	},
	serendepity: 4,
	shtriga:6,
	silence:1,
	singularity:-20,
	sinkhole:3,
	siphon:4,
	siphonactive:3,
	siphonstrength:4,
	skyblitz:10,
	snipe:7,
	sosa:6,
	soulcatch:2,
	spores:4,
	sskin:5,
	steal:6,
	steam:6,
	stoneform:1,
	"storm 2":6,
	"storm 3":12,
	"summon FateEgg":5,
	"summon Firefly":6,
	"summon Scarab":4,
	"summon Shadow":3,
	swave:6,
	tempering:[2,3],
	tesseractsummon:3,
	throwrock:4,
	tick:function(c){
		return c.type == etg.Spell ? 1 : 1+(c.maxhp-c.truehp())/c.maxhp;
	},
	tornado:9,
	trick:4,
	turngolem:function(c){
		return c.status.get("storedpower")/3;
	},
	upkeep:-.5,
	upload:3,
	vampire:function(c, ttatk){
		return (c.type == etg.Spell?c.card.attack:ttatk)*.7;
	},
	virtue:function(c){
		return c.type == etg.Spell ? (c.owner.foe.shield ? Math.min(c.owner.foe.shield.truedr(), c.card.attack) : 0) : (c.trueatk() - getDamage(c)) / 1.5;
	},
	virusplague:1,
	void:5,
	voidshell:function(c){
		return (c.owner.maxhp - c.owner.hp) / 10;
	},
	quantagift:4,
	web:1,
	wind:function(c){
		return c.status.get("storedAtk")/2 - 2;
	},
	wisdom:4,
	yoink:4,
	vengeance:2,
	vindicate:3,
	pillar:pillarval,
	pend:pillarval,
	pillmat:pillarval,
	pillspi:pillarval,
	pillcar:pillarval,
	absorber:5,
	blockwithcharge:function(c){
		return c.status.get("charges")/(1+c.owner.foe.countcreatures()*2);
	},
	cold:7,
	despair:5,
	evade100:function(c){
		return !c.status.get("charges") && c.owner == c.owner.game.turn?0:1;
	},
	"evade 40":1,
	"evade 50":1,
	firewall:7,
	chaos:[8, 9],
	skull:5,
	slow:6,
	solar:function(c){
		var coq = c.owner.quanta[etg.Light];
		return 5-4*coq/(4+coq);
	},
	thorn:5,
	weight:5,
	wings:function(c){
		return !c.status.get("charges") && c.owner == c.owner.game.turn?0:6;
	},
});
var statusValues = Object.freeze({
	airborne: 0.2,
	ranged: 0.2,
	voodoo: 1,
	swarm: 1,
	tunnel: 3,
	cloak: function(c) {
		return !c.status.get("charges") && c.owner == c.owner.game.turn?0:4;
	},
	flooding: function(c) {
		return c.owner.foe.countcreatures() - 3;
	},
	patience: function(c) {
		return 1 + c.owner.countcreatures() * 2;
	},
	freedom: 5,
	reflective: 1
})

function getDamage(c){
	return damageHash[c.hash()] || 0;
}
function estimateDamage(c, freedomChance, wallCharges, wallIndex) {
	if (!c || c.status.get("frozen") || c.status.get("delayed")){
		return 0;
	}
	function estimateAttack(tatk){
		if (momentum) {
			return tatk;
		} else if (fshactive && (~fshactive.name.indexOf("weight") || ~fshactive.name.indexOf("wings")) && fshactive.func(c.owner.foe.shield, c)) {
			return 0;
		}else if (wallCharges[wallIndex]){
			wallCharges[wallIndex]--;
			return 0;
		}else return Math.max(tatk - dr, 0);
	}
	var tatk = c.trueatk(), fsh = c.owner.foe.shield, fshactive = fsh && fsh.active.shield;
	var momentum = !fsh || tatk <= 0 || c.status.get("momentum") || c.status.get("psionic") ||
		(c.status.get("burrowed") && c.owner.permanents.some(function(pr){ return pr && pr.status.get("tunnel") }));
	var dr = momentum ? 0 : fsh.truedr(), atk = estimateAttack(tatk);
	if (c.status.get("adrenaline")) {
		var attacks = etg.countAdrenaline(tatk);
		while (c.status.get("adrenaline") < attacks) {
			c.status.incr("adrenaline", 1);
			atk += estimateAttack(c.trueatk());
		}
		c.status.set("adrenaline", 1);
	}
	if (!momentum && fshactive){
		atk *= (~fshactive.name.indexOf("evade100") ? 0 : ~fshactive.name.indexOf("evade 50") ? .5 : ~fshactive.name.indexOf("evade 40") ? .6 : ~fshactive.name.indexOf("chaos") && fsh.card.upped ? .8 : 1);
	}
	if (!fsh && freedomChance && c.status.get("airborne")){
		atk += Math.ceil(atk/2) * freedomChance;
	}
	if (c.owner.foe.sosa) atk *= -1;
	damageHash[c.hash()] = atk;
	return atk;
}
function calcExpectedDamage(pl, wallCharges, wallIndex) {
	var totalDamage = 0, stasisFlag = false, freedomChance = 0;
	for(var i=0; i<16; i++){
		var p;
		if (p=pl.permanents[i]){
			if (!stasisFlag && (p.status.get("stasis") || p.status.get("patience"))){
				stasisFlag = true;
			}else if (p.status.get("freedom")){
				freedomChance++;
			}
		}
		if (!stasisFlag && (p=pl.foe.permanents[i]) && p.status.get("stasis")){
			stasisFlag = true;
		}
	}
	if (freedomChance) freedomChance = 1-Math.pow(.7, freedomChance);
	if (pl.foe.shield && pl.foe.shield.hasactive("shield", "blockwithcharge")){
		wallCharges[wallIndex] = pl.foe.shield.status.get("charges");
	}
	if (!stasisFlag){
		pl.creatures.forEach(function(c){
			var dmg = estimateDamage(c, freedomChance, wallCharges, wallIndex);
			if (dmg && !(c.status.get("psionic") && pl.foe.shield && pl.foe.shield.status.get("reflective"))){
				totalDamage += dmg;
			}
		});
	}
	return totalDamage + estimateDamage(pl.weapon, freedomChance, wallCharges, wallIndex) + pl.foe.status.get("poison");
}

function evalactive(c, active, extra){
	var sum = 0;
	for(var i=0; i<active.name.length; i++){
		var aval = SkillsValues[active.name[i]];
		sum += aval === undefined?0:
			aval instanceof Function?aval(c, extra):
			aval instanceof Array?aval[c.card.upped?1:0]:aval;
	}
	return sum;
}

function checkpassives(c) {
	var score = 0, kl = c.status.keys.length;
	for (var i=0; i<kl; i++){
		var status = c.status.keys[i];
		// Skip cloak if it expires at end of turn
		if (uniqueStatuses.has(status) && c.type == etg.Spell && !(status == "cloak" && !c.status.get("charges") && c.owner == c.owner.game.turn)) {
			if (!uniquesSkill[status]) {
				uniquesSkill[status] = true;
			}
			else {
				continue;
			}
		}
		var sval = statusValues[status];
		score += !sval ? 0 : sval instanceof Function ? sval(c) : sval;
	}
	return score;
}

var throttled = Object.freeze({"poison 1":true, "poison 2":true, "poison 3":true, neuro:true, regen:true, siphon:true});
function evalthing(c) {
	if (!c) return 0;
	var ttatk, hp, poison, score = 0;
	var isCreature = c.card.type == etg.Creature, isAttacker = isCreature || c.card.type == etg.Weapon;
	if (isAttacker){
		var ctrueatk = c.trueatk();
		var adrenalinefactor = c.status.get("adrenaline") ? etg.countAdrenaline(ctrueatk) : 1;
		var delaymix = Math.max(c.status.get("frozen"), c.status.get("delayed"))/adrenalinefactor, delayfactor = delaymix?1-Math.min(delaymix/5, .6):1;
	}else{
		var delaymix = 0, delayfactor = 1, adrenalinefactor = 1;
	}
	if (isCreature){
		hp = Math.max(c.truehp(), 0);
		poison = c.status.get("poison");
		if (poison > 0){
			hp = Math.max(hp - poison*2, 0);
			if (c.status.get("aflatoxin")) score -= 2;
		}else if (poison < 0){
			hp += Math.min(-poison, c.maxhp-c.hp);
		}
	}
	if (isAttacker) {
		ttatk = getDamage(c);
		if (c.status.get("psionic") && c.owner.foe.shield && c.owner.foe.shield.status.get("reflective")) ttatk *= -1;
		score += ctrueatk/20;
		score += ttatk*delayfactor;
	}else ttatk = 0;
	var throttlefactor = adrenalinefactor < 3 || (isCreature && c.owner.weapon && c.owner.weapon.status.get("nothrottle")) ? adrenalinefactor : 2;
	for (var key in c.active) {
		var adrfactor = key in throttled ? throttlefactor : key == "disarm" ? 1 : adrenalinefactor;
		if (key == "hit"){
			score += evalactive(c, c.active.hit, ttatk)*(ttatk?1:c.status.get("immaterial")?0:.3)*adrfactor*delayfactor;
		}else if(key == "auto"){
			if (!c.status.get("frozen")){
				score += evalactive(c, c.active.auto, ttatk)*adrfactor;
			}
		}else if (key == "cast"){
			if (caneventuallyactive(c.castele, c.cast, c.owner)){
				score += evalactive(c, c.active.cast, ttatk) * delayfactor;
			}
		}else if (key != (isCreature ? "shield" : "owndeath")){
			score += evalactive(c, c.active[key]);
		}
	}
	score += checkpassives(c);
	if (isCreature){
		if (c.owner.gpull == c){
			score = (score + hp) * Math.log(hp)/4;
			if (c.status.get("voodoo")) score += hp;
			if (c.active.shield && !delaymix){
				score += evalactive(c, c.active.shield);
			}
		}else score *= hp?(c.status.get("immaterial") || c.status.get("burrowed") ? 1.3 : 1+Math.log(Math.min(hp, 33))/7):.2;
	}else{
		score *= c.status.get("immaterial")?1.35:1.25;
	}
	if (delaymix){ // TODO this is redundant alongside delayfactor
		var delayed = Math.min(delaymix*(c.status.get("adrenaline")?.5:1), 12);
		score *= 1-(12*delayed/(12+delayed))/16;
	}
	log(c, score);
	return score;
}

function evalcardinstance(cardInst) {
	var c = cardInst.card;
	if (!caneventuallyactive(c.costele, c.cost, cardInst.owner)){
		return c.active.discard == Skills.obsession ? (c.upped?-7:-6) : 0;
	}
	var score = 0;
	if (c.type == etg.Spell){
		score += evalactive(cardInst, c.active.cast);
	} else {
		for (var key in c.active) {
			score += evalactive(cardInst, c.active[key]);
		}
		score += checkpassives(cardInst);
		if (c.type == etg.Creature){
			score += c.attack;
			var hp = Math.max(c.health, 0), poison = c.status.get("poison");
			if (poison > 0){
				hp = Math.max(hp - poison*2, 0);
				if (c.status.get("aflatoxin")) score -= 2;
			}else if (poison < 0){
				hp += Math.min(-poison, c.maxhp-c.hp);
			}
			score *= hp?(c.status.get("immaterial") || c.status.get("burrowed") ? 1.3 : 1+Math.log(Math.min(hp, 33))/7):.5;
		}else if (c.type == etg.Weapon){
			score += c.attack;
			if (cardInst.owner.weapon || cardInst.owner.hand.some(function(cinst){ return cinst.card.type == etg.Weapon })) score /= 2;
		}else if (c.type == etg.Shield){
			score += c.health*c.health;
			if (cardInst.owner.shield || cardInst.owner.hand.some(function(cinst){ return cinst.card.type == etg.Shield })) score /= 2;
		}
	}
	score *= !cardInst.card.cost ? .8 : (cardInst.canactive() ? .6 : .5) * (!cardInst.card.costele?1:.9+Math.log(1+cardInst.owner.quanta[cardInst.card.costele])/50);
	log(c, score);
	return score;
}

function caneventuallyactive(element, cost, pl){
	if (!cost || !element || pl.quanta[element] || !pl.mark || pl.mark == element) return true;
	return pl.permanents.some(function(pr){
		return pr && ((pr.card.type == etg.Pillar && (!pr.card.element || pr.card.element == element)) || (pr.active == Skills.locket && pr.status.get("mode") == element));
	});
}

var uniqueStatuses = new Set(["flooding", "nightfall", "tunnel", "patience", "cloak"]);
var uniquesSkill, damageHash;

module.exports = function(game) {
	logStart();
	if (game.winner){
		return game.winner==game.player1?99999999:-99999999;
	}
	if (game.player1.deck.length == 0 && game.player1.hand.length < 8){
		return -99999990;
	}
	var wallCharges = new Int32Array([0, 0]);
	damageHash = [];
	uniquesSkill = {flooding: false, nightfall: false, tunnel: false, patience: false, cloak: false};
	var expectedDamage = calcExpectedDamage(game.player2, wallCharges, 0);
	if (expectedDamage > game.player1.hp){
		return Math.min(expectedDamage - game.player1.hp, 500)*-999;
	}
	if (game.player2.deck.length == 0){
		return 99999980;
	}
	expectedDamage = calcExpectedDamage(game.player1, wallCharges, 1); // Call to fill damageHash
	var gamevalue = expectedDamage > game.player2.hp ? 999 : 0;
	for (var j = 0;j < 2;j++) {
		if (j == 1){
			// Reset non global effects
			uniquesSkill.tunnel = false;
			uniquesSkill.patience = false;
			uniquesSkill.cloak = false;
		}
		logNest(j);
		var player = game.players(j), pscore = wallCharges[j]*4 + player.markpower;
		pscore += evalthing(player.weapon);
		pscore += evalthing(player.shield);
		logNest("creas");
		for (var i = 0; i < 23; i++) {
			pscore += evalthing(player.creatures[i]);
		}
		logNestEnd();
		logNest("perms");
		for (var i = 0; i < 16; i++) {
			pscore += evalthing(player.permanents[i]);
		}
		logNestEnd();
		logNest("hand");
		for (var i = 0; i < player.hand.length; i++) {
			pscore += evalcardinstance(player.hand[i]);
		}
		logNestEnd();
		// Remove this if logic is updated to call endturn
		if (player != game.turn && player.hand.length < 8 && player.deck.length){
			var card = player.deck.pop();
			player.addCard(card);
			pscore += evalcardinstance(player.hand[player.hand.length-1]);
			player.hand.pop();
			player.deck.push(card);
		}
		pscore += Math.min(8-player.hand.length, player.drawpower)*2 + Math.sqrt(player.hp)*4 - player.status.get("poison");
		if (player.precognition) pscore += .5;
		if (!player.weapon) pscore += 1;
		if (!player.shield) pscore += 1;
		if (player.usedactive) pscore -= (player.hand.length+(player.hand.length>6?7:4))/4;
		if (player.flatline) pscore -= 1;
		if (player.status.get("neuro")) pscore -= 5;
		log("Eval", pscore);
		logNestEnd();
		gamevalue += pscore*(j?-1:1);
	}
	log("Eval", gamevalue);
	logEnd();
	damageHash = uniquesSkill = null;
	return gamevalue;
}
