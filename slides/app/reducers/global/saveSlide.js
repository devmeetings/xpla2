// @flow

import _ from 'lodash'

import logger from '../../components/logger'
import {getFilesWithActiveAsJsArray} from '../../reducers.utils/editors'

import {nonNull, cast} from '../../assert'
import {saveFile} from '../../reducers.utils/saveFile'

export function saveSlide (state: any) {
  let lastNumber = state.get('lastGeneratedSlideNumber')
  if (!lastNumber) {
    lastNumber = window.prompt('Slide number [default: 1]', 1)
    lastNumber = parseInt(lastNumber, 10)
    lastNumber -= 1
    if (isNaN(lastNumber) || lastNumber < 0) {
      return state
    }
  }
  const currentNumber = lastNumber + 1

  const slideName = window.prompt('Slide title', `Slide ${currentNumber}`)
  if (!slideName) {
    return state
  }

  generateSlide(state.toJS(), slideName)
    .then((slideContent) => {
      saveFile(slideContent, convertToFileName(slideName, currentNumber))
    })
    .catch((e) => {
      logger.error(e)
      window.alert('Unable to fetch & save slide')
    })

  return state.merge({
    lastGeneratedSlideNumber: currentNumber
  })
}

function generateSlide (state, slideName) {
  const $slide = nonNull(document.querySelector('[xp-slide]'))
  const slideUrl = nonNull($slide.getAttribute('xp-slide'))
  const $doc = $slide.ownerDocument

  const link = $doc.createElement('link')
  link.rel = 'import'
  link.href = slideUrl

  return new Promise((resolve, reject) => {
    link.onerror = reject
    link.onload = function (e) {
      const l = cast(link)
      const clone = l.import.querySelector('html').cloneNode(true)
      // Fill in the editors
      _.values(state.editors).map((editor, idx) => {
        const $editor = clone.querySelectorAll('xp-editor')[idx]
        $editor.setAttribute('active', editor.active.name)

        const files = getFilesWithActiveAsJsArray(editor)
        files.forEach((file) => {
          const content = fixPossibleScriptTags(file.content)
          const $script = $editor.querySelector(`script[id='${file.name}']`)

          if ($script && file.touched) {
            $script.removeAttribute('script')
            $script.setAttribute('type', 'application/octetstream')
            $script.innerHTML = `\n${content}\n`
          } else if (file.touched) {
            const $s = $doc.createElement('script')
            $s.setAttribute('id', file.name)
            $s.setAttribute('type', 'application/octetstream')
            $s.innerHTML = `\n${content}\n`
          }
        })
      })

      // Fill the title
      fill(clone, 'title', slideName)
      // Update annotations
      const $annotations = clone.querySelector('xp-annotations')
      if ($annotations) {
        fill($annotations, 'header', state.annotations.header)
        fill($annotations, 'details', state.annotations.details)
      }
      // TODO [ToDr] Update annotations.

      resolve(clone.outerHTML)
    }
    nonNull($doc.head).appendChild(link)
  })
}

function fill ($dom, selector, value) {
  let $elem = $dom.querySelector(selector)
  if (!$elem && !value) {
    return
  }

  if (!$elem) {
    $elem = $dom.ownerDocument.createElement(selector)
    $dom.appendChild($elem)
  }

  $elem.innerHTML = value
}

function fixPossibleScriptTags (val) {
  return val.replace(/<\/script>/gi, '<+/script>')
}

function convertToFileName (slideName, number) {
  return `${number}_${slideName}.html`
}
