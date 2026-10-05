/**
 * Limite por chave (IP) em janela deslizante, em memória. Função pura: o estado (Map)
 * e o relógio vêm de fora, o que facilita testar.
 * Devolve true se a tentativa passa e a registra; false se estourou o limite.
 */
export function allowHit(
	hits: Map<string, number[]>,
	key: string,
	now: number,
	max: number,
	windowMs: number,
): boolean {
	// Poda: descarta chaves cuja última tentativa já saiu da janela, pro Map não crescer sem fim.
	for (const [k, times] of hits) {
		if (now - (times.at(-1) ?? 0) >= windowMs) hits.delete(k);
	}
	const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
	if (recent.length >= max) {
		hits.set(key, recent);
		return false;
	}
	recent.push(now);
	hits.set(key, recent);
	return true;
}
