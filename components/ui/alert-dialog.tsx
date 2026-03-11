/**
 * Alert Dialog — built on top of the existing Dialog primitive
 * so no extra Radix dependency is needed.
 */
"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Re-export compatible API surface

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

function AlertDialogContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogContent className={className}>
      {children}
    </DialogContent>
  )
}

const AlertDialogHeader = DialogHeader
const AlertDialogFooter = DialogFooter
const AlertDialogTitle = DialogTitle
const AlertDialogDescription = DialogDescription

interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function AlertDialogAction({ className, ...props }: AlertDialogActionProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogCancel({ className, children, ...props }: AlertDialogActionProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
