import test from 'node:test';
import assert from 'node:assert/strict';
import { destinationAfterExit, finalePose } from './finale.mjs';

test('only the last exit leads to the canopy, never a restart',()=>{
  for(let i=0;i<4;i++)assert.equal(destinationAfterExit(i,5),'complete');
  assert.equal(destinationAfterExit(4,5),'finale');
});
test('girl rests on the canopy before ascending and victory stays terminal',()=>{
  assert.equal(finalePose(0).girlY,finalePose(2.5).girlY);
  assert.ok(finalePose(4).girlY<finalePose(2.5).girlY);
  assert.equal(finalePose(5.9).won,false);
  assert.equal(finalePose(6).won,true);
  assert.deepEqual(finalePose(100),finalePose(6));
});
test('reduced motion keeps the canopy still and still reaches victory',()=>{
  assert.equal(finalePose(0,true).girlY,finalePose(6,true).girlY);
  assert.equal(finalePose(6,true).canopyOffset,0);
  assert.equal(finalePose(6,true).won,true);
});
