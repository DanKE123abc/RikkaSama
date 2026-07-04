let currentSpeed = 0

export function setTokenSpeed(speed: number): void {
  currentSpeed = speed
}

export function getTokenSpeed(): number {
  return currentSpeed
}

export function resetTokenSpeed(): void {
  currentSpeed = 0
}
