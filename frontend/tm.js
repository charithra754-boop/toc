export function runDemoTM(container){
  // Simple interactive unary increment TM: computes n -> n+1 where input is unary '1...1' followed by blank '_'
  container.innerHTML = ''
  const ctrl = document.createElement('div')
  ctrl.style.display='flex'; ctrl.style.gap='8px'; ctrl.style.marginBottom='8px'
  const btnStep = document.createElement('button'); btnStep.textContent='Step'
  const btnRun = document.createElement('button'); btnRun.textContent='Run'
  const btnReset = document.createElement('button'); btnReset.textContent='Reset'
  ctrl.appendChild(btnStep); ctrl.appendChild(btnRun); ctrl.appendChild(btnReset)

  const tapeWrap = document.createElement('div')
  tapeWrap.style.display='flex'; tapeWrap.style.gap='6px'; tapeWrap.style.alignItems='center'; tapeWrap.style.padding='10px'; tapeWrap.style.background='linear-gradient(180deg, rgba(255,255,255,0.01), transparent)'
  const tapeCells = []

  function makeCell(ch){
    const d = document.createElement('div')
    d.textContent = ch
    d.style.width='36px'; d.style.height='36px'; d.style.display='flex'; d.style.alignItems='center'; d.style.justifyContent='center'
    d.style.background='rgba(255,255,255,0.03)'; d.style.border='1px solid rgba(255,255,255,0.04)'
    return d
  }

  // initial tape: three 1s and a blank
  let cells = ['1','1','1','_']
  let head = 0
  let running = false
  let interval = null

  function renderTape(){
    tapeWrap.innerHTML = ''
    tapeCells.length = 0
    cells.forEach((c,i)=>{
      const d = makeCell(c)
      if(i===head) d.style.outline = '2px solid rgba(110,231,183,0.25)'
      tapeWrap.appendChild(d)
      tapeCells.push(d)
    })
  }

  // TM transition: move right until blank, write '1' at blank then halt
  function tmStep(){
    if(cells[head] === '_'){
      cells[head] = '1'
      return false // halt
    } else {
      head++
      if(head >= cells.length) cells.push('_')
      return true // continue
    }
  }

  function reset(){ cells = ['1','1','1','_']; head = 0; renderTape() }

  btnStep.addEventListener('click', ()=>{ const cont = tmStep(); renderTape(); })
  btnRun.addEventListener('click', ()=>{
    if(running) return
    running = true
    interval = setInterval(()=>{
      const cont = tmStep()
      renderTape()
      if(!cont){ clearInterval(interval); running=false }
    }, 300)
  })
  btnReset.addEventListener('click', ()=>{ if(interval) clearInterval(interval); running=false; reset() })

  container.appendChild(ctrl)
  container.appendChild(tapeWrap)
  const info = document.createElement('div')
  info.style.marginTop='10px'
  info.textContent = 'Demo TM: unary increment (visual, step/run/reset)'
  container.appendChild(info)

  renderTape()
}
