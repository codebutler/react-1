/** @jsxImportSource @emotion/react */
'use client'

import { Box, Stack } from '@jsxcss/emotion'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

type QueueOption<TItem, TSelected> = {
  select: (item: TItem) => TSelected
  worker: (selected: TSelected) => void
}
type AnyFunction = (...args: any[]) => any
type Notify = () => void
class CallbackQueue<TItem, TSelected extends AnyFunction> {
  private notifiers: Notify[] = []
  private worker
  private select
  private isWorking = false

  constructor(public items: TItem[] = [], { select, worker }: QueueOption<TItem, TSelected>) {
    this.select = select
    this.worker = worker
  }

  private runNext = () => {
    if (this.isWorking || this.items.length === 0) {
      return
    }
    this.isWorking = true
    const item = this.items.shift()
    this.notify()
    if (item) {
      this.worker(((...args) => {
        this.isWorking = false
        setTimeout(() => this.select(item)(...args), 0)
        this.runNext()
      }) as TSelected)
    }
  }

  public add = (callback: TItem) => {
    this.items.push(callback)
    this.notify()
    setTimeout(this.runNext, 0)
  }

  public clear = () => {
    this.items = []
    this.notify()
  }

  public subscribe = (notify: Notify) => {
    this.notifiers.push(notify)

    const unsubscribe = () => {
      this.notifiers = this.notifiers.filter((item) => item !== notify)
    }

    return unsubscribe
  }

  private notify = () => {
    this.items = [...this.items]
    this.notifiers.forEach((notify) => notify())
  }
}

const useQueue = <TItem, TSelected extends AnyFunction>(
  initialValue: TItem[],
  options: QueueOption<TItem, TSelected>
) => {
  const [queue] = useState(new CallbackQueue<TItem, TSelected>(initialValue, options))
  const items = useSyncExternalStore(
    queue.subscribe,
    () => queue.items,
    () => queue.items
  )
  return useMemo(() => ({ items, add: queue.add, clear: queue.clear }), [items, queue.add, queue.clear])
}

const Page = () => {
  const queue = useQueue(
    [] as {
      text: string
      fn: (date: Date) => void
    }[],
    {
      select: (item) => item.fn,
      worker: (fn) => setTimeout(() => fn(new Date()), 1500),
    }
  )

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

export default Page

const useInterval = (fn: () => void, ms: number) =>
  useEffect(() => {
    const id = setInterval(fn, ms)
    return () => clearInterval(id)
  }, [fn, ms])
