/**
 * TypewriterText — streaming character-by-character text reveal
 * Variable speed: punctuation gets longer delays for natural pacing
 */

import React, { useState, useEffect, useRef, memo } from 'react'
import { Text } from 'ink'

interface TypewriterTextProps {
  text: string
  speed?: number        // base ms per character (default 15)
  punctuationDelay?: number  // extra ms for punctuation (default 80)
  color?: string
  onComplete?: () => void
  showCursor?: boolean
  maxLength?: number    // truncate after this many chars (default unlimited)
}

export const TypewriterText = memo(({
  text,
  speed = 15,
  punctuationDelay = 80,
  color,
  onComplete,
  showCursor = true,
  maxLength,
}: TypewriterTextProps) => {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cursorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cursor blink
  useEffect(() => {
    cursorTimerRef.current = setInterval(() => {
      setCursorVisible(v => !v)
    }, 530)
    return () => {
      if (cursorTimerRef.current) clearInterval(cursorTimerRef.current)
    }
  }, [])

  // Start typing
  useEffect(() => {
    // Reset on new text
    setDisplayed('')
    setIsDone(false)
    indexRef.current = 0
    setCursorVisible(true)

    if (!text) {
      setIsDone(true)
      onComplete?.()
      return
    }

    const displayText = maxLength && text.length > maxLength
      ? text.slice(0, maxLength) + '…'
      : text
    const totalLen = displayText.length

    const tick = () => {
      indexRef.current++

      // Don't exceed the text length
      if (indexRef.current > totalLen) {
        setIsDone(true)
        setCursorVisible(false)
        onComplete?.()
        return
      }

      setDisplayed(displayText.slice(0, indexRef.current))

      if (indexRef.current < totalLen) {
        // Variable delay based on character
        const ch = displayText[indexRef.current - 1]
        let delay = speed

        // Punctuation gets longer pauses (natural pacing)
        if (ch === '.' || ch === '!' || ch === '?') {
          delay += punctuationDelay * 2
        } else if (ch === ',' || ch === ';' || ch === ':') {
          delay += punctuationDelay
        } else if (ch === '-' || ch === '—') {
          delay += punctuationDelay * 0.5
        } else if (ch === ' ') {
          delay = speed * 0.3 // fast through spaces
        }

        timerRef.current = setTimeout(tick, delay)
      } else {
        // Done
        setIsDone(true)
        setCursorVisible(false)
        onComplete?.()
      }
    }

    timerRef.current = setTimeout(tick, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, speed, punctuationDelay, maxLength, onComplete])

  return (
    <Text color={color}>
      {displayed}
      {showCursor && !isDone && (
        <Text color={color} bold={cursorVisible}>
          {cursorVisible ? '▋' : ' '}
        </Text>
      )}
    </Text>
  )
})

TypewriterText.displayName = 'TypewriterText'

export default TypewriterText
