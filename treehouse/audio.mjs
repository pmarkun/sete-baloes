// Original score: "Galhos de amanhã", a gentle C-major waltz at 96 BPM.
// Synthesized locally: no streaming, external services, or audio dependencies.
import { rhythmPattern, RHYTHM_TICK } from './rhythm.mjs';
const melody = [72,76,79,81,79,76, 74,77,81,84,81,77, 71,74,79,83,79,74, 72,76,79,76,74,72];
const roots = [48,53,55,48];
const hz = midi => 440 * 2 ** ((midi-69)/12);
export class Soundscape {
  constructor() {
    this.context=null;this.enabled=true;this.active=false;this.beat=0;this.nextBeat=0;this.voices=new Set();
    try { this.enabled=localStorage.getItem('treehouse-sound')!=='off'; } catch {}
  }
  async unlock() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if(!Context)return;
    if(!this.context){
      this.context=new Context();this.bus=this.context.createGain();
      this.bus.gain.value=this.enabled?.55:0;this.bus.connect(this.context.destination);
    }
    if(this.context.state==='suspended')await this.context.resume();
    this.nextBeat=Math.max(this.nextBeat,this.context.currentTime+.02);
  }
  toggle() {
    this.enabled=!this.enabled;
    if(this.context)this.bus.gain.setTargetAtTime(this.enabled?.55:0,this.context.currentTime,.03);
    try{localStorage.setItem('treehouse-sound',this.enabled?'on':'off');}catch{}
    return this.enabled;
  }
  setActive(active) {
    if(this.active===active)return;this.active=active;
    if(!active){for(const voice of this.voices){try{voice.stop();}catch{}}}
    else if(this.context){this.nextBeat=this.context.currentTime+.03;this.beat=0;}
  }
  setScene(music) {
    const key=JSON.stringify(music?.rhythm||null);
    if(key===this.scene)return;
    this.scene=key;this.pattern=music?.rhythm?rhythmPattern(music.rhythm):null;this.beat=0;
    for(const voice of this.voices){try{voice.stop();}catch{}}
    if(this.context)this.nextBeat=this.context.currentTime+.15;
  }
  tone(midi,duration=.16,volume=.09,type='triangle',when=0,slide=0) {
    if(!this.context||!this.enabled||this.voices.size>40)return;
    const t=Math.max(this.context.currentTime,when),o=this.context.createOscillator(),g=this.context.createGain();
    o.type=type;o.frequency.setValueAtTime(hz(midi),t);
    if(slide)o.frequency.exponentialRampToValueAtTime(hz(midi+slide),t+duration);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.009);
    g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g).connect(this.bus);this.voices.add(o);
    o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.03);
  }
  update() {
    if(!this.active||!this.context||this.context.state!=='running')return;
    const now=this.context.currentTime;
    if(this.nextBeat<now-.5)this.nextBeat=now;
    while(this.nextBeat<now+.1){
      if(this.pattern){
        const i=this.beat%this.pattern.length;
        if(i===0){this.tone(48,2,.035,'sine',this.nextBeat);this.tone(67,2,.018,'sine',this.nextBeat);}
        if(this.pattern[i]){this.tone(55,.18,.16,'triangle',this.nextBeat,-12);this.tone(79,.08,.045,'sine',this.nextBeat);}
        this.nextBeat+=RHYTHM_TICK;this.beat++;continue;
      }
      const i=this.beat%melody.length,root=roots[Math.floor(i/6)];
      this.tone(melody[i],.29,.065,'triangle',this.nextBeat);
      this.tone(root+(i%3===0?0:12),.32,.045,'sine',this.nextBeat);
      if(i%3===1)this.tone(root+19,.23,.025,'triangle',this.nextBeat);
      this.nextBeat+=60/96/2;this.beat++;
    }
  }
  effect({type,value}) {
    if(!this.context)return;const now=this.context.currentTime;
    if(type==='jump')this.tone(65,.14,.13,'square',now,12);
    else if(type==='lever'){this.tone(42,.09,.16,'triangle');this.tone(54,.08,.10,'square',now+.07);}
    else if(type==='hatch'){this.tone(36,.24,.2,'triangle',now,-9);this.tone(48,.12,.1,'square',now+.09);}
    else if(type==='impact')this.tone(35,.35,.25,'triangle',now,-14);
    else if(type==='crate')this.tone(38,.10,.15,'triangle',now,-5);
    else if(type==='bell')this.tone([0,72,76,79][value],.6,.18,'sine');
    else if(type==='portal'){[60,67,74,81].forEach((n,i)=>this.tone(n,.35,.1,'sine',now+i*.075));}
    else if(type==='caught'){this.tone(67,.35,.1,'triangle',now,-12);}
    else if(type==='creature'){this.tone(38,.6,.12,'triangle',now,-5);this.tone(73,.18,.06,'square',now+.3);}
    else if(type==='powerOff')this.tone(50,.24,.09,'triangle',now,-18);
    else if(type==='powerOn')this.tone(42,.18,.08,'triangle',now,12);
    else if(type==='grow'){[60,64,67,72,76].forEach((n,i)=>this.tone(n,.22,.10,'triangle',now+i*.08));}
    else if(type==='mirror'){[84,72,88,76].forEach((n,i)=>this.tone(n,.18,.11,'sine',now+i*.09));}
    else if(type==='rope'){this.tone(58,.16,.09,'triangle',now,7);}
    else if(type==='droplet'){this.tone(72,.22,.08,'sine',now,-19);this.tone(48,.16,.05,'triangle',now+.08);}
    else if(type==='victory'){[72,76,79,84].forEach((n,i)=>this.tone(n,.7,.14,'triangle',now+i*.16));}
    else {this.tone(79,.15,.1,'sine');this.tone(84,.26,.08,'sine',now+.1);}
  }
}
