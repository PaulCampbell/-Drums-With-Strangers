import react, { useState, useEffect } from 'react'
import Head from 'next/head'
import useInterval from 'react-useinterval'

const wavs = ['kick.mp3', 'clap.mp3', 'snare.mp3',  'hat_open.mp3', 'hat_closed.mp3']

function preloadAudio(){
  wavs.forEach(w => {
    var audio = new Audio(w);
    audio.preload = "auto";
    audio.volume = 0.000000001;
    audio.play();
  })
}

function playSound(path){
  var audio = new Audio(path);
  audio.play();
}

export default function Home() {
  const numSteps = 16
  const [tempo, setTempo] = useState(120)
  const [activeStep, setActiveStep] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isJustStarted, setIsJustStarted] = useState(false)
  const [instruments, setInstruments] = useState([
    { order: 1, name: 'kick', sample: 'kick.mp3', pattern: new Array(numSteps).fill(false)},
    { order: 2, name: 'clap', sample: 'clap.mp3', pattern: new Array(numSteps).fill(false)},
    { order: 3, name: 'snare', sample: 'snare.mp3', pattern: new Array(numSteps).fill(false)},
    { order: 4, name: 'hat open', sample: 'hat_open.mp3', pattern: new Array(numSteps).fill(false)},
    { order: 5, name: 'hat closed', sample: 'hat_closed.mp3', pattern: new Array(numSteps).fill(false)},
  ])

  useEffect(() => preloadAudio(), [])

  function playSamples(step) {
    const instrumentsToPlay = instruments.filter(i => i.pattern[step])
    instrumentsToPlay.forEach(i => playSound(i.sample))
  }

  useInterval(() => {
    setIsJustStarted(false)
    if(isStarted) {
      playSamples(activeStep === numSteps -1 ? 0 : activeStep + 1)
    }
    setActiveStep(activeStep === numSteps -1 ? 0 : activeStep + 1)
  }, ((1000*60) / tempo) / 4)

  function toggleIsStarted() {
    setIsStarted(!isStarted)
    if(!isStarted) {
      setIsJustStarted(true)
      setActiveStep(numSteps - 1)
    }
  }

  function toggleBeat(instrument, beatIndex) {
    instrument.pattern[beatIndex] = !instrument.pattern[beatIndex]
    setInstruments(instruments.filter(i => i.name != instrument.name).concat([instrument]))
  }

  function getStepCssClasses(instrument, index) {
    const cssClasses = ['step', 'column']
    if(index % 4) {
      cssClasses.push('first-beat')
    }
    if(instrument.pattern[index] == 1) {
      cssClasses.push('beat-on')
    }
    if(isStarted && !isJustStarted &&  index == activeStep) {
      cssClasses.push('active')
    }
    return cssClasses
  }

  function changeTempo(e) {
    setTempo(e.target.value)
  }

  return (
    <div className="container">
      <Head>
        <title>Drums with strangers</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.0/css/bulma.min.css" />
      </Head>

      <main className="section">
        <h1 className="title">
          Drums With Strangers
        </h1>
        <div className="machine">
          { instruments.sort((a, b) => {
            if(a.order > b.order)
              return 1
            return -1
          }).map(instrument=> {
            return <div className="columns is-mobile">
                <div className="column is-2">
                  {instrument.name}
                </div>
                { [...Array(numSteps)].map((_, i) => {
                  return <div onClick={() => toggleBeat(instrument, i)} className={getStepCssClasses(instrument, i).join(" ")}>
                  </div>
                })}
              </div>
          })}
        </div>
        <label className="label">
          Tempo
          <input type="number" className="input" value={tempo} min="50" max="200" onChange={changeTempo} />
        </label>
        <a href="#" className="button" onClick={toggleIsStarted}>{ isStarted ? "Stop" : "Start" }</a>
      </main>

      <footer className="footer">
        DWS
      </footer>

      <style jsx>{`
      .machine { margin-bottom:2em;}
      .step {
        background-color: #dedede;
        margin:2px;
        border-radius: 4px;
      }
      .step:hover {
        box-shadow: inset 0 0 10px #0f0;
      }
      .first-beat {
        background-color: #bbb;
      }
      .beat-on {
        background-color: #8696af;
        box-shadow: inset 0 0 5px #000;
      }
      .active {
        background-color: green;
      }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
