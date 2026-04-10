import { useEffect, useRef, useState } from "react";
import { apiService } from "../services/api";
import { useAuthStore } from "../store/authStore";

const padPin = (input: string) => input.slice(0, 4).replace(/\D/g, "");

export default function LoginPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser, setSession, setError: setAuthError } = useAuthStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleDigit = (digit: string) => {
    if (isLoading) return;
    setPin((prev) => padPin(prev + digit));
    setError(null);
  };

  const handleBackspace = () => {
    if (isLoading) return;
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isLoading) return;
    setPin("");
    setError(null);
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits.");
      return;
    }

    setIsLoading(true);
    setAuthError(undefined);

    try {
      const result = await apiService.loginWithPIN(pin);
      if (!result) {
        setError("Invalid PIN. Please try again.");
        return;
      }

      setUser(result.user);
      setSession(result.session_id, result.terminal_id);
      setPin("");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Login failed. Try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSubmit();
    if (event.key === "Backspace") handleBackspace();
    if (/^\d$/.test(event.key)) handleDigit(event.key);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">Mashsia POS</h1>
          <p className="mt-2 text-sm text-slate-300">
            Enter your 4-digit PIN to continue
          </p>
        </header>

        <div className="mb-6">
          <label
            htmlFor="pin-input"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            PIN
          </label>
          <input
            id="pin-input"
            ref={inputRef}
            type="password"
            value={pin}
            maxLength={4}
            onChange={() => undefined}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-center text-2xl font-semibold text-white tracking-[0.5em] outline-none focus:ring-2 focus:ring-slate-400"
          />
          {error && (
            <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-white">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              disabled={isLoading}
              className="h-14 rounded-lg border border-slate-700 bg-slate-900 text-lg font-semibold transition hover:bg-slate-800 disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || pin.length === 0}
            className="h-14 rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            disabled={isLoading}
            className="h-14 rounded-lg border border-slate-700 bg-slate-900 text-lg font-semibold transition hover:bg-slate-800 disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isLoading || pin.length === 0}
            className="h-14 rounded-lg border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            ←
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || pin.length !== 4}
          className="mt-6 w-full rounded-lg bg-slate-200 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Please wait..." : "Login"}
        </button>
      </div>
    </div>
  );
}
