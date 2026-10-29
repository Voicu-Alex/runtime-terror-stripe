(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FreemiumV6 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var KEY = 'v6-freemium-demo-v3';
  var LEGACY_KEYS = ['v6-freemium-demo-v2','v6-freemium-demo-v1'];
  var VERSION = 3;
  var CATEGORIES = ['work', 'business', 'housing', 'transport', 'savings', 'energy', 'other'];
  var ANSWERS = ['yes', 'no', 'not_applicable', 'prefer_not_to_say'];
  var PROFILE_TAGS = ['angajat','angajat_it','caut_primul_job','pfa','srl_dividende','chiriaș','cumpar_locuinta','sofer','consumator_energie','consumator_gaz','pilon2','pilon3','elev_student'];
  function empty() {
    return { version: VERSION, initialAvailable: true, profileReviewed: false, profileConfirmed: false, profileAnswers: {}, profileTags: [], rewardEarned: false, rewardClaimed: false, rewardAvailable: false, legacyRewardConsumed:false, candidateAnswers: {}, unlocks: {}, reports: {} };
  }
  function obj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function validRecord(s) {
    if (!obj(s) || s.version !== VERSION || typeof s.initialAvailable !== 'boolean' || typeof s.profileReviewed !== 'boolean' || typeof s.profileConfirmed !== 'boolean' || typeof s.rewardEarned !== 'boolean' || typeof s.rewardClaimed !== 'boolean' || typeof s.rewardAvailable !== 'boolean' || typeof s.legacyRewardConsumed!=='boolean' || !obj(s.profileAnswers) || !Array.isArray(s.profileTags) || !obj(s.candidateAnswers) || !obj(s.unlocks) || !obj(s.reports)) return false;
    if (s.rewardAvailable && (!s.rewardClaimed || !s.rewardEarned)) return false;
    if (s.rewardClaimed && !s.rewardEarned) return false;
    if (s.profileConfirmed && !s.profileReviewed) return false;
    Object.keys(s.profileAnswers).forEach(function (k) { if (CATEGORIES.indexOf(k) < 0 || ANSWERS.indexOf(s.profileAnswers[k]) < 0) throw Error('invalid profile'); });
    s.profileTags.forEach(function(t){if(PROFILE_TAGS.indexOf(t)<0)throw Error('invalid tag');});
    Object.keys(s.candidateAnswers).forEach(function (id) { if (!/^[a-z0-9_-]+$/.test(id) || !obj(s.candidateAnswers[id])) throw Error('invalid candidate'); Object.keys(s.candidateAnswers[id]).forEach(function(k){ if (!/^[a-z0-9_-]+$/.test(k) || ['yes','no','unsure'].indexOf(s.candidateAnswers[id][k]) < 0) throw Error('invalid answer'); }); });
    var slots = { initial: 0, profile_reward: 0 };
    Object.keys(s.unlocks).forEach(function (id) {
      var u = s.unlocks[id];
      if (!/^[a-z0-9_-]+$/.test(id) || !obj(u) || ['initial','profile_reward','legacy'].indexOf(u.slot) < 0 || typeof u.unlockedAt !== 'string' || !Number.isFinite(Date.parse(u.unlockedAt))) throw Error('invalid unlock');
      if (u.slot !== 'legacy') slots[u.slot] += 1;
    });
    if (slots.initial > 1 || slots.profile_reward > 1 || (s.initialAvailable && slots.initial) || (s.rewardAvailable && slots.profile_reward) || (slots.profile_reward && !s.rewardClaimed)) return false;
    Object.keys(s.reports).forEach(function(id){ var r=s.reports[id]; if(!/^[a-z0-9_-]+$/.test(id)||!obj(r)||r.kind!=='not_applicable'||typeof r.createdAt!=='string'||!Number.isFinite(Date.parse(r.createdAt))) throw Error('invalid report'); });
    return true;
  }
  function migrate(s) {
    if (!obj(s) || [1,2].indexOf(s.version)<0 || !obj(s.unlocks)) return null;
    var state=empty(), rewardUses=0, initialUses=0;
    Object.keys(s.unlocks).forEach(function(id){var u=s.unlocks[id];if(!/^[a-z0-9_-]+$/.test(id)||!obj(u)||['initial','profile_reward','legacy'].indexOf(u.slot)<0)return;var at=typeof u.unlockedAt==='string'&&Number.isFinite(Date.parse(u.unlockedAt))?u.unlockedAt:new Date(0).toISOString();var slot=u.slot;if(slot==='initial'&&initialUses++)slot='legacy';else if(slot==='profile_reward'&&rewardUses++)slot='legacy';if(slot==='legacy'&&s.version===2&&s.legacyRewardConsumed)rewardUses++;state.unlocks[id]={slot:slot,unlockedAt:at};});
    state.initialAvailable=s.initialAvailable!==false&&initialUses===0;
    state.profileReviewed=s.profileReviewed===true;state.profileConfirmed=s.version===1?state.profileReviewed:s.profileConfirmed===true;
    state.profileAnswers=obj(s.profileAnswers)?s.profileAnswers:{};state.profileTags=Array.isArray(s.profileTags)?s.profileTags.filter(function(t){return PROFILE_TAGS.indexOf(t)>=0;}):[];
    state.rewardEarned=s.rewardEarned===true||rewardUses>0;state.rewardClaimed=(s.rewardClaimed===true||rewardUses>0)&&state.rewardEarned;
    state.rewardAvailable=state.rewardClaimed&&rewardUses===0&&(s.rewardAvailable!==false||s.version===1);
    state.legacyRewardConsumed=rewardUses>0||s.legacyRewardConsumed===true;
    state.candidateAnswers=obj(s.candidateAnswers)?s.candidateAnswers:{};state.reports=obj(s.reports)?s.reports:{};
    if(state.legacyRewardConsumed)state.rewardAvailable=false;
    return state;
  }
  function validAnswers(answers) { return obj(answers) && CATEGORIES.every(function (c) { return ANSWERS.indexOf(answers[c]) >= 0; }); }
  function dateKey(d) { return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0'); }
  function actionAllowed(item, now) {
    if (!item || item.actionAvailable !== true || item.lawInForce !== true || item.sourceVerified !== true || item.verified !== true || item.example === true) return false;
    if (item.deadline) { if (!/^\d{4}-\d{2}-\d{2}$/.test(item.deadline) || item.deadline < dateKey(now)) return false; }
    return true;
  }
  function create(storage) {
    function read() {
      try {
        var raw=storage&&storage.getItem(KEY);if(!raw&&storage){for(var i=0;i<LEGACY_KEYS.length&&!raw;i++)raw=storage.getItem(LEGACY_KEYS[i]);}if(!raw)return empty();var parsed=JSON.parse(raw);
        if (validRecord(parsed)) return parsed;
        var migrated = migrate(parsed); if(migrated&&validRecord(migrated)){try{if(storage)storage.setItem(KEY,JSON.stringify(migrated));}catch(_){}return migrated;} return empty();
      } catch (_) { return empty(); }
    }
    var state = read();
    function snapshot() { return JSON.parse(JSON.stringify(state)); }
    function save() { try { if (storage) storage.setItem(KEY, JSON.stringify(state)); } catch (_) {} return snapshot(); }
    function credits() { return (state.initialAvailable ? 1 : 0) + (state.rewardAvailable ? 1 : 0); }
    function getAccess(id) { return Object.prototype.hasOwnProperty.call(state.unlocks,id) ? 'unlocked' : 'teaser'; }
    function checked(item, now) {
      now = now || new Date();
      if (!actionAllowed(item, now)) return false;
      var facts = state.candidateAnswers[item.id];
      if (!facts || !Array.isArray(item.requiredAnswers) || !item.requiredAnswers.length) return false;
      return item.requiredAnswers.every(function (key) { return facts[key] === 'yes'; });
    }
    function eligibleCandidates(items, now) {
      now = now || new Date();
      return (items || []).filter(function (i) { return checked(i, now) && !state.unlocks[i.id]; }).sort(function (a,b) {
        var da = a.deadline || null, db = b.deadline || null;
        var daysA = da ? Math.floor((Date.parse(da+'T00:00:00Z') - Date.parse(dateKey(now)+'T00:00:00Z'))/86400000) : Infinity;
        var daysB = db ? Math.floor((Date.parse(db+'T00:00:00Z') - Date.parse(dateKey(now)+'T00:00:00Z'))/86400000) : Infinity;
        var nearA = daysA >= 0 && daysA <= 30, nearB = daysB >= 0 && daysB <= 30;
        if (nearA !== nearB) return nearA ? -1 : 1;
        if (nearA && daysA !== daysB) return daysA-daysB;
        var va = Number.isFinite(a.net12Verified === true ? a.net12 : NaN) ? a.net12 : -Infinity;
        var vb = Number.isFinite(b.net12Verified === true ? b.net12 : NaN) ? b.net12 : -Infinity;
        if (va !== vb) return vb-va;
        if (daysA !== daysB) return daysA-daysB;
        return String(a.id).localeCompare(String(b.id));
      });
    }
    return {
      getState: snapshot, getAccess: getAccess, credits: credits,
      completeProfile: function (answers, confirmed, tags) {
        if (!validAnswers(answers)) return { ok:false, reason:'review_all_categories' };
        if (confirmed !== true) return { ok:false, reason:'confirmation_required' };
        tags = Array.isArray(tags) ? tags.filter(function(t,i){return PROFILE_TAGS.indexOf(t)>=0&&tags.indexOf(t)===i;}) : [];
        var changed = JSON.stringify(state.profileAnswers) !== JSON.stringify(answers) || JSON.stringify(state.profileTags) !== JSON.stringify(tags);
        state.profileAnswers = JSON.parse(JSON.stringify(answers)); state.profileTags = tags.slice(); state.profileReviewed = true; state.profileConfirmed = true; state.rewardEarned = true;
        if (changed) state.candidateAnswers = {};
        return { ok:true, state:save() };
      },
      claimProfileReward: function (accountLabel) {
        if (!String(accountLabel || '').trim()) return { ok:false, reason:'account_required' };
        var alreadyClaimed = state.rewardClaimed;
        if (!alreadyClaimed && (!state.profileReviewed || !state.profileConfirmed || !state.rewardEarned)) return { ok:false, reason:'profile_incomplete' };
        if (!alreadyClaimed) { state.rewardClaimed = true; state.rewardAvailable = true; save(); }
        return { ok:true, state:snapshot(), alreadyClaimed:alreadyClaimed };
      },
      invalidateProfile: function(){state.profileReviewed=false;state.profileConfirmed=false;state.candidateAnswers={};save();},
      invalidateEligibility: function(id){if(id&&state.candidateAnswers[id]){delete state.candidateAnswers[id];save();}},
      confirmEligibility: function (item, answers) {
        if (!item || !item.id) return {ok:false,reason:'missing_item'};
        if (!actionAllowed(item,new Date())) return {ok:false,reason:'action_unavailable'};
        if (!Array.isArray(item.requiredAnswers) || !item.requiredAnswers.length || !obj(answers)) return {ok:false,reason:'missing_facts'};
        var clean={}; item.requiredAnswers.forEach(function(k){ if(['yes','no','unsure'].indexOf(answers[k])>=0)clean[k]=answers[k]; });
        if (Object.keys(clean).length !== item.requiredAnswers.length) return {ok:false,reason:'missing_facts'};
        state.candidateAnswers[item.id]=clean; save();
        return {ok:true,eligible:item.requiredAnswers.every(function(k){return clean[k]==='yes';}),state:snapshot()};
      },
      unlock: function (item, now, visibleAnswers) {
        if (!item || !item.id) return {ok:false,reason:'missing_item'};
        if (state.unlocks[item.id]) return {ok:true,state:snapshot(),alreadyUnlocked:true};
        if (visibleAnswers && state.candidateAnswers[item.id] && item.requiredAnswers.some(function(k){return visibleAnswers[k]!==state.candidateAnswers[item.id][k];})) {
          var current={}; item.requiredAnswers.forEach(function(k){if(['yes','no','unsure'].indexOf(visibleAnswers[k])>=0)current[k]=visibleAnswers[k];});
          state.candidateAnswers[item.id]=current; save(); return {ok:false,reason:'answers_changed'};
        }
        if (!checked(item,now)) return {ok:false,reason:actionAllowed(item,now||new Date())?'not_verified_eligible':'action_unavailable'};
        var slot=state.initialAvailable?'initial':state.rewardAvailable?'profile_reward':null;
        if (!slot) return {ok:false,reason:'no_credit'};
        state.unlocks[item.id]={slot:slot,unlockedAt:(now||new Date()).toISOString()};
        if(slot==='initial')state.initialAvailable=false;else state.rewardAvailable=false;
        save();return {ok:true,slot:slot,state:snapshot()};
      },
      reportNotApplicable: function(id,now) {
        if(!id||!state.unlocks[id])return {ok:false,reason:'not_unlocked'};
        state.reports[id]={kind:'not_applicable',createdAt:(now||new Date()).toISOString()};
        save();return {ok:true,refunded:false,state:snapshot()};
      },
      eligibleCandidates: eligibleCandidates,
      proValue: function (items, profile) {
        if (!state.profileConfirmed) return {eligible:false,value:0,reason:'profile_unverified'};
        var list=eligibleCandidates(items).filter(function(i){return i.example!==true&&i.demoFixture!==true&&i.net12Verified===true&&Number.isFinite(i.net12)&&i.net12>0;});
        var rewardAlreadyUsed=state.legacyRewardConsumed||Object.keys(state.unlocks).some(function(id){return state.unlocks[id].slot==='profile_reward';});
        var allocations=(state.initialAvailable?1:0)+(state.rewardEarned&&!rewardAlreadyUsed?1:0);
        var value=list.slice(allocations).reduce(function(n,i){return n+i.net12;},0);
        return {eligible:value>=180,value:value,reason:value>=180?'threshold_met':'below_threshold'};
      }
    };
  }
  return {create:create,categories:CATEGORIES.slice(),profileTags:PROFILE_TAGS.slice(),storageKey:KEY,legacyStorageKeys:LEGACY_KEYS.slice()};
});
