/** @jsxImportSource @emotion/react */
'use client'

import { Box, Stack } from '@jsxcss/emotion'
import { motion } from 'framer-motion'
import { useInterval } from '~/hooks'
import { createQueue } from '~/utils'

const initialItems: { text: string; fn: (date: Date) => void }[] = []
const itemQueue = createQueue(initialItems, {
  select: (item) => item.fn,
  worker: (fn) => setTimeout(() => fn(new Date()), 1500),
})

export default function Page() {
  return (
    <>
      <Comp1 />
      <Comp2 />
    </>
  )
}

const Comp1 = () => {
  const queue = itemQueue.use()

  useInterval(
    () =>
      queue.add({
        text: `interval at ${new Date().toISOString()}`,
        fn: (date) => console.log(`Task at ${date}`),
      }),
    1600
  )

  return (
    <Stack.Horizontal spacing={12}>
      See console
      <br />
      (check rendered queue)
      <Stack.Vertical spacing={8}>
        <div>
          <button
            onClick={() =>
              queue.add({
                text: `clicked at ${new Date().toISOString()}`,
                fn: (date) => console.log(`Task at ${date}`),
              })
            }
          >
            queue.add on click
          </button>
        </div>
        <div>
          <button onClick={() => queue.clear()}>reset</button>
        </div>
      </Stack.Vertical>
      <Box
        as={motion.div}
        layout
        width={300}
        border={'1px solid white'}
        height={200}
        overflow={'scroll'}
        display={'flex'}
        flexDirection={'column-reverse'}
      >
        {queue.items.map(({ text }) => (
          <Box
            key={text}
            as={motion.div}
            layout
            initial={{
              y: -10,
            }}
            animate={{
              y: 0,
            }}
            fontSize={8}
          >
            {text}
          </Box>
        ))}
      </Box>
    </Stack.Horizontal>
  )
}

const Comp2 = () => {
  console.log('hi')

  const queue = itemQueue.use()

  console.log('rendered', queue.items)

  useInterval(
    () =>
      queue.add({
        text: `interval at ${new Date().toISOString()}`,
        fn: (date) => console.log(`Task at ${date}`),
      }),
    600
  )

  return (
    <Stack.Horizontal spacing={12}>
      See console
      <br />
      (check rendered queue)
      <Stack.Vertical spacing={8}>
        <div>
          <button
            onClick={() =>
              queue.add({
                text: `clicked at ${new Date().toISOString()}`,
                fn: (date) => console.log(`Task at ${date}`),
              })
            }
          >
            queue.add on click
          </button>
        </div>
        <div>
          <button onClick={() => queue.clear()}>reset</button>
        </div>
      </Stack.Vertical>
      <Box
        as={motion.div}
        layout
        width={300}
        border={'1px solid white'}
        height={200}
        overflow={'scroll'}
        display={'flex'}
        flexDirection={'column-reverse'}
      >
        {queue.items.map(({ text }) => (
          <Box
            key={text}
            as={motion.div}
            layout
            initial={{
              y: -10,
            }}
            animate={{
              y: 0,
            }}
            fontSize={8}
          >
            {text}
          </Box>
        ))}
      </Box>
    </Stack.Horizontal>
  )
}
