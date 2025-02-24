import { Block, HighlightedCodeBlock, parseRoot } from "codehike/blocks"
import { z } from "zod"
import { AbsoluteFill, Composition, Sequence } from "remotion"
import React from "react"
import { ProgressBar } from "./progress-bar"
import { Code } from "./code"
import "./index.css"

import Content from "./content.md"
const { steps, videoTitle } = parseRoot(
  Content,
  Block.extend({
    videoTitle: z.string(),
    steps: z.array(
      Block.extend({
        code: HighlightedCodeBlock,
        duration: z.string().transform((v) => parseInt(v, 10)),
        title: z.string()
      })
    ),
  })
)

export default function RemotionRoot() {
  const duration = steps.reduce((acc, step) => acc + step.duration, 0)
  return (
    <Composition
      id="Ram"
      component={Video}
      defaultProps={{ steps }}
      durationInFrames={duration}
      fps={60}
      width={780}
      height={900}
    />
  )
}

function Video({ steps }) {
  let stepEnd = 0
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D1117" }}>
      <ProgressBar steps={steps} />
      {steps.map((step, index) => {
        stepEnd += step.duration
        return (
          <Sequence
            key={index}
            from={stepEnd - step.duration}
            durationInFrames={step.duration}
            name={step.title}
            style={{ padding: "16px 42px", display: 'block' }}
          > 
            <div className="header">
                <div className="watermark">
                  <div className="wm-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 224 216" fill="none">
                      <ellipse cx="112" cy="108" rx="112" ry="108" fill="black"/>
                      <circle cx="112.5" cy="108.5" r="87.5" fill="white"/>
                      <circle cx="112" cy="108" r="72" fill="black"/>
                      <circle cx="112" cy="108" r="63" fill="white"/>
                      <line x1="112" y1="15" x2="112" y2="39" stroke="black" stroke-width="8"/>
                      <line x1="112" y1="180" x2="112" y2="204" stroke="black" stroke-width="8"/>
                      <line x1="180" y1="104" x2="204" y2="104" stroke="black" stroke-width="8"/>
                      <line x1="19" y1="104" x2="43" y2="104" stroke="black" stroke-width="8"/>
                    </svg>
                  </div>
                  <div className="wm-brandname">Think Throo</div>
                </div>
                <div className="wm-brandname">https://thinkthroo.com</div>
              </div>
            <div className="step-container">

              <div className="title-container">
                <div className="concept-title">{videoTitle}</div>
                <div className="step-title">{step.title}</div>
                {/* <div className="marketing-caption"><div className="grow-brand">Grow your brand</div> with videos like this. <br />Comment or DM us now.</div> */}
              </div>
              <Code
                oldCode={steps[index - 1]?.code}
                newCode={step.code}
                durationInFrames={90}
              />
            </div>
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
