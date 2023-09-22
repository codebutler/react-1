import { useMemo, useSyncExternalStore } from 'react'

type QueueOption<TItem, TSelected> = {
  select: (item: TItem) => TSelected
  worker: (selected: TSelected) => void
}
type AnyFunction = (...args: any[]) => any
type Notify = () => void
export class CallbackQueue<TItem, TSelected extends AnyFunction> {
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

export const createQueue = <TItem, TSelected extends AnyFunction>(
  initialItems: TItem[],
  options: QueueOption<TItem, TSelected>
) => {
  const queue = new CallbackQueue<TItem, TSelected>(initialItems, options)

  const useQueue = () => {
    const items = useSyncExternalStore(
      queue.subscribe,
      () => queue.items,
      () => queue.items
    )
    return useMemo(
      () => ({
        items,
        add: queue.add,
        clear: queue.clear,
      }),
      [items]
    )
  }

  return {
    use: useQueue,
  }
}
