import Signal from "@antivivi/lemon-signal";
import { HttpService } from "@rbxts/services";

type ToastVariant = "info" | "success" | "warning" | "error";

interface ToastOptions {
    message: string;
    duration?: number;
    variant?: ToastVariant;
    icon?: string;
    id?: string;
}

interface ToastRequest extends ToastOptions {
    id: string;
    createdAt: number;
    variant: ToastVariant;
    duration: number;
}

const toastSignal = new Signal<(toast: ToastRequest) => void>();

export const DEFAULT_TOAST_DURATION = 3.5;
export const MAX_TOAST_QUEUE = 3;

export function subscribeToasts(listener: (toast: ToastRequest) => void) {
    return toastSignal.connect(listener);
}

export function showToast(options: ToastOptions): string {
    const { message, duration, variant, icon, id } = options;
    if (message === undefined || message === "") {
        error("Toast message cannot be empty");
    }

    const toast: ToastRequest = {
        id: id ?? HttpService.GenerateGUID(false),
        message,
        duration: duration ?? DEFAULT_TOAST_DURATION,
        variant: variant ?? "info",
        icon,
        createdAt: tick(),
    };

    toastSignal.fire(toast);
    return toast.id;
}

export function showErrorToast(message: string, duration?: number) {
    return showToast({ message, duration, variant: "error" });
}

export function showSuccessToast(message: string, duration?: number) {
    return showToast({ message, duration, variant: "success" });
}

export function showWarningToast(message: string, duration?: number) {
    return showToast({ message, duration, variant: "warning" });
}

export type { ToastOptions, ToastRequest, ToastVariant };
