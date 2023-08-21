import { useRef, useEffect, memo } from 'react';
import classNames from 'classnames';
import  usePrefersReducedMotion  from '../../hooks/usePrefersReducedMotion';
import { spring, chain, delay, value } from 'popmotion';
import VisuallyHidden from '../VisuallyHidden';
import './index.css';

// prettier-ignore
// const glyphs = [
//     'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए',
//     'ऐ', 'ओ', 'औ', 'अं', 'अः', 'क', 'ख', 'ग',
//     'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट',
//     'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध',
//     'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र',
//     'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र',
//     'ज्ञ'
//   ];

const glyphs = [
  'श्रे', 'ш', 'レ', '슈', '瑞',
  'य', 'й', 'ヤ', '여', '伊',
  'स',  'サ', '사', '萨',
  'प', 'п', 'パ', '파', '帕',
  'तं', 'т', 'タン', '탐', '唐',
  'गे', 'ゲ', '게', '葛'
];

const CharType = {
  Glyph: 'glyph',
  Value: 'value',
};

function shuffle(content, output, position) {
  return content.map((value, index) => {
    if (index < position) {
      return { type: CharType.Value, value };
    }

    if (position % 1 < 0.5) {
      const rand = Math.floor(Math.random() * glyphs.length);
      return { type: CharType.Glyph, value: glyphs[rand] };
    }

    return { type: CharType.Glyph, value: output[index].value };
  });
}

const DecoderText = ({
  text,
  start = true,
  delay: startDelay = 0,
  className,
  ...rest
}) => {
  const output = useRef([{ type: CharType.Glyph, value: '' }]);
  const container = useRef();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const containerInstance = container.current;
    const content = text.split('');
    let animation;

    const renderOutput = () => {
      const characterMap = output.current.map(item => {
        return `<span class="decoder-text__${item.type}">${item.value}</span>`;
      });

      containerInstance.innerHTML = characterMap.join('');
    };

    const springValue = value(0, position => {
      output.current = shuffle(content, output.current, position);
      renderOutput();
    });

    if (start && !animation && !reduceMotion) {
      animation = chain(
        delay(startDelay),
        spring({
          from: 0,
          to: content.length,
          stiffness: 8,
          damping: 5,
        })
      ).start(springValue);
    }

    if (reduceMotion) {
      output.current = content.map((value, index) => ({
        type: CharType.Value,
        value: content[index],
      }));
      renderOutput();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [reduceMotion, start, startDelay, text]);

  return (
    <span className={classNames('decoder-text', className)} {...rest}>
      <VisuallyHidden className="decoder-text__label">{text}</VisuallyHidden>
      <span aria-hidden className="decoder-text__content" ref={container} />
    </span>
  );
};

export default memo(DecoderText);
