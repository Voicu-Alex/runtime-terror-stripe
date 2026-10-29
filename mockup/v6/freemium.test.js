const test = require('node:test');
const assert = require('node:assert/strict');
const { create, storageKey, legacyStorageKeys, categories } = require('./freemium.js');
const prima = require('./prima.js');
function memory() { const data = new Map(); return { getItem: k => data.get(k) || null, setItem: (k,v) => data.set(k,v), data }; }
const answers = Object.fromEntries(categories.map(c => [c,'prefer_not_to_say']));
function item(id, net12, extra={}) { return Object.assign({id, net12, net12Verified:true, verified:true, sourceVerified:true, lawInForce:true, actionAvailable:true, requiredAnswers:['age_16_to_29']}, extra); }
const facts = { age_16_to_29:'yes' };
function profile(f){ assert.equal(f.completeProfile(answers,true).ok,true); }
function eligible(f, candidate){ assert.equal(f.confirmEligibility(candidate,facts).eligible,true); }
test('profile reward needs all reviewed categories and explicit confirmation; refusal is valid', () => {
  const f=create(memory());
  assert.equal(f.completeProfile({work:'prefer_not_to_say'},true).reason,'review_all_categories');
  assert.equal(f.completeProfile(answers,false).reason,'confirmation_required');
  assert.equal(f.completeProfile(answers,true).ok,true);
  assert.equal(f.getState().rewardEarned,true);
});
test('guest can use the initial guide after candidate-specific eligibility without completing the reward profile', () => {
  const store=memory(), f=create(store);
  const declared=Object.fromEntries(prima.requiredAnswers.map(k=>[k,'yes']));
  assert.equal(f.getState().profileConfirmed,false);
  assert.equal(f.confirmEligibility(prima,declared).eligible,true);
  assert.equal(f.unlock(prima,new Date('2026-10-29T10:00:00Z'),declared).slot,'initial');
  assert.equal(f.credits(),0);
  assert.equal(create(store).getAccess(prima.id),'unlocked');
});
test('claim changes one initial right to two and is idempotent', () => {
  const f=create(memory()); assert.equal(f.credits(),1); profile(f);
  assert.equal(f.claimProfileReward('').reason,'account_required');
  assert.equal(f.claimProfileReward('Cont demo').ok,true); assert.equal(f.credits(),2);
  assert.equal(f.claimProfileReward('Cont demo').alreadyClaimed,true); assert.equal(f.credits(),2);
});
test('two distinct guide unlocks consume 2→1→0; third blocked, reload and reopen stay at zero', () => {
  const store=memory(), f=create(store); profile(f); f.claimProfileReward('Cont demo');
  const one=item('prima_stabilitate',null,{net12Verified:false}), two=item('second_verified',null,{net12Verified:false}), three=item('third',null,{net12Verified:false});
  eligible(f,one); eligible(f,two); eligible(f,three); assert.equal(f.credits(),2);
  assert.equal(f.unlock(one,new Date('2026-10-29T10:00:00Z')).slot,'initial'); assert.equal(f.credits(),1);
  assert.equal(f.unlock(two,new Date('2026-10-29T10:01:00Z')).slot,'profile_reward'); assert.equal(f.credits(),0);
  assert.equal(f.unlock(three).reason,'no_credit'); assert.equal(f.credits(),0);
  assert.equal(f.claimProfileReward('Cont demo').alreadyClaimed,true); assert.equal(f.credits(),0);
  const reloaded=create(store); assert.equal(reloaded.credits(),0); assert.equal(reloaded.getAccess(one.id),'unlocked');
  assert.equal(reloaded.unlock(one).alreadyUnlocked,true); assert.equal(reloaded.credits(),0);
});
test('failed eligibility and expired action debit nothing, even while its law remains in force', () => {
  const f=create(memory()); profile(f); const candidate=item('expired',20,{deadline:'2026-10-28'});
  assert.equal(f.confirmEligibility(candidate,facts).reason,'action_unavailable');
  assert.equal(f.unlock(candidate,new Date('2026-10-29T00:00:00Z')).reason,'action_unavailable');
  const current=item('current',20); f.confirmEligibility(current,{age_16_to_29:'no'});
  assert.equal(f.unlock(current).reason,'not_verified_eligible'); assert.equal(f.credits(),1);
});
test('edited visible fact invalidates a previous yes confirmation before reveal', () => {
  const f=create(memory());profile(f);const candidate=item('edited',500);eligible(f,candidate);
  const changed={age_16_to_29:'no'};
  assert.equal(f.unlock(candidate,new Date('2026-10-29T00:00:00Z'),changed).reason,'answers_changed');
  assert.equal(f.credits(),1);assert.equal(f.getAccess(candidate.id),'teaser');
  assert.equal(f.eligibleCandidates([candidate]).length,0);
  assert.equal(f.unlock(candidate).reason,'not_verified_eligible');assert.equal(f.credits(),1);
});
test('an unsure employer exclusion answer fails closed without spending a credit', () => {
  const f=create(memory());profile(f);const candidate=item('employer-unknown',50,{requiredAnswers:['employer_outside_exclusions']});
  const result=f.confirmEligibility(candidate,{employer_outside_exclusions:'unsure'});
  assert.equal(result.ok,true);assert.equal(result.eligible,false);
  assert.equal(f.unlock(candidate).reason,'not_verified_eligible');assert.equal(f.credits(),1);
});
test('deadline candidate ordering prioritizes nearest actionable date; old deadline excluded', () => {
  const f=create(memory()); profile(f);
  const big=item('big',500), soon2=item('soon2',20,{deadline:'2026-11-20'}), soon1=item('soon1',10,{deadline:'2026-11-02'}), expired=item('expired',900,{deadline:'2026-10-28'});
  [big,soon2,soon1].forEach(x=>eligible(f,x));
  assert.equal(f.confirmEligibility(expired,facts).reason,'action_unavailable');
  assert.deepEqual(f.eligibleCandidates([big,soon2,soon1,expired],new Date('2026-10-29T00:00:00Z')).map(x=>x.id),['soon1','soon2','big']);
});
test('one-time not-applicable report persists and never refunds', () => {
  const store=memory(), f=create(store); profile(f); const x=item('opened',50); eligible(f,x); f.unlock(x);
  assert.equal(f.reportNotApplicable(x.id).refunded,false); assert.equal(f.credits(),0);
  assert.equal(create(store).getState().reports[x.id].kind,'not_applicable');
});
test('corrupt unlock state and unsupported versions fall back safely', () => {
  const corrupt=memory(); corrupt.setItem(storageKey,JSON.stringify({version:2,initialAvailable:true,profileReviewed:false,profileConfirmed:false,profileAnswers:{},rewardEarned:false,rewardClaimed:false,rewardAvailable:false,candidateAnswers:{},unlocks:{fake:true},reports:{}}));
  assert.equal(create(corrupt).credits(),1); assert.equal(create(corrupt).getAccess('fake'),'teaser');
  const unsupported=memory(); unsupported.setItem(storageKey,JSON.stringify({version:999})); assert.equal(create(unsupported).credits(),1);
  const broken={getItem(){return '{';},setItem(){throw Error('quota');}}; assert.equal(create(broken).credits(),1);
});
test('legacy v1 completion migrates without granting a duplicate initial right', () => {
  const store=memory(); store.setItem(legacyStorageKeys[1],JSON.stringify({version:1,initialAvailable:false,profileReviewed:true,rewardEarned:true,rewardClaimed:false,unlocks:{old:{slot:'initial',unlockedAt:'2026-10-01T00:00:00.000Z'}}}));
  const f=create(store); assert.equal(f.credits(),0); assert.equal(f.getState().profileConfirmed,true); assert.equal(f.claimProfileReward('Cont demo').ok,true); assert.equal(f.credits(),1); assert.ok(store.getItem(storageKey));
});
test('legacy v1 duplicate reward unlocks preserve every opened guide and grant no new credit',()=>{
  const store=memory();store.setItem(legacyStorageKeys[1],JSON.stringify({version:1,initialAvailable:false,profileReviewed:true,rewardEarned:true,rewardClaimed:true,unlocks:{initial_guide:{slot:'initial',unlockedAt:'2026-10-01T00:00:00.000Z'},reward_guide_a:{slot:'profile_reward',unlockedAt:'2026-10-02T00:00:00.000Z'},reward_guide_b:{slot:'profile_reward',unlockedAt:'2026-10-03T00:00:00.000Z'}}}));
  const f=create(store);assert.equal(f.credits(),0);['initial_guide','reward_guide_a','reward_guide_b'].forEach(id=>assert.equal(f.getAccess(id),'unlocked'));
  const reload=create(store);assert.equal(reload.credits(),0);['initial_guide','reward_guide_a','reward_guide_b'].forEach(id=>assert.equal(reload.getAccess(id),'unlocked'));
});
test('fix1 v2 duplicate reward records migrate without reset or new rights',()=>{
  const store=memory();store.setItem(legacyStorageKeys[0],JSON.stringify({version:2,initialAvailable:false,profileReviewed:true,profileConfirmed:true,profileAnswers:{},profileTags:[],rewardEarned:true,rewardClaimed:true,rewardAvailable:true,candidateAnswers:{},unlocks:{initial_guide:{slot:'initial',unlockedAt:'2026-10-01T00:00:00.000Z'},reward_guide_a:{slot:'profile_reward',unlockedAt:'2026-10-02T00:00:00.000Z'},reward_guide_b:{slot:'profile_reward',unlockedAt:'2026-10-03T00:00:00.000Z'}},reports:{}}));
  const f=create(store);assert.equal(f.credits(),0);['initial_guide','reward_guide_a','reward_guide_b'].forEach(id=>assert.equal(f.getAccess(id),'unlocked'));
  const reload=create(store);assert.equal(reload.credits(),0);['initial_guide','reward_guide_a','reward_guide_b'].forEach(id=>assert.equal(reload.getAccess(id),'unlocked'));
});
test('Pro value excludes earned free rights and nonverified examples; 180 threshold only applies incrementally', () => {
  const f=create(memory()); profile(f); f.claimProfileReward('Cont demo');
  const list=[item('free1',300),item('free2',300),item('extra',179),item('example',1000,{example:true}),item('uncertain',1000,{net12Verified:false})];
  list.filter(x=>!x.example).forEach(x=>eligible(f,x)); assert.equal(f.proValue(list).eligible,false);
  list[2].net12=180; assert.equal(f.proValue(list).eligible,true);
});
test('sourced prima guide requires all declared facts, has no assumed deadline or Pro value', () => {
  const f=create(memory()); profile(f);
  const allYes=Object.fromEntries(prima.requiredAnswers.map(k=>[k,'yes']));
  assert.equal(prima.id,'prima_stabilitate');
  assert.equal(prima.deadline,null);
  assert.equal(prima.checked,'2026-10-29');
  assert.ok(prima.sources.some(x=>x.url==='https://static.anaf.ro/static/10/Anaf/legislatie/OUG_11_2026.pdf'));
  assert.equal(f.confirmEligibility(prima,allYes).eligible,true);
  assert.equal(f.eligibleCandidates([prima]).length,1);
  assert.equal(f.unlock(prima).slot,'initial');
  assert.equal(f.proValue([prima]).value,0);
});
test('Pro value excludes exactly unused free allocations across zero, one, and two reveals',()=>{
  const f=create(memory());profile(f);const list=[item('a',100),item('b',100),item('c',100)];list.forEach(x=>eligible(f,x));
  assert.equal(f.proValue(list).value,100); // two rights unused, third candidate is incremental
  f.claimProfileReward('Cont demo');assert.equal(f.proValue(list).value,100);
  f.unlock(list[0]);assert.equal(f.proValue(list).value,100); // one right unused
  f.unlock(list[1]);assert.equal(f.proValue(list).value,100); // no rights unused
});
