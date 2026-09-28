export type ProxyPayload = Record<string, unknown>

export type ProxyAdapter = {
  forward(payload: ProxyPayload): Promise<unknown>
}
