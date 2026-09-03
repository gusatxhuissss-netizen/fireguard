import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Flame, LogIn, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const [name, setName] = useState("");
  const utils = trpc.useUtils();
  useEffect(() => setName(user?.name ?? ""), [user?.name]);
  const update = trpc.fireguard.updateProfile.useMutation({ onSuccess: () => { utils.auth.me.invalidate(); toast.success("Perfil atualizado."); }, onError: error => toast.error(error.message) });
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f7f7ef]">Carregando perfil…</div>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#f7f7ef] p-5"><Card className="w-full max-w-md rounded-2xl border-[#dbe6d8] bg-[#fcfdf9] text-center shadow-none"><CardContent className="p-8"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e7f0df] text-[#3c7259]"><ShieldCheck className="h-6 w-6" /></span><h1 className="mt-5 font-serif text-3xl">Sua conta FireGuard</h1><p className="mt-3 text-sm leading-6 text-[#71877e]">Entre ou crie uma conta para registrar e acompanhar denúncias.</p><Button onClick={() => startLogin()} className="mt-7 w-full rounded-xl bg-[#1c4a3d] font-bold hover:bg-[#10332d]"><LogIn className="mr-2 h-4 w-4" />Entrar ou cadastrar-se</Button><Link href="/" className="mt-4 inline-block text-xs font-bold text-[#3c7259]">Voltar à página inicial</Link></CardContent></Card></main>;
  return <main className="min-h-screen bg-[#f7f7ef] p-5 text-[#173b35] lg:p-8"><div className="mx-auto max-w-3xl"><div className="mb-9 flex items-center justify-between"><Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-[#416f5d]"><ArrowLeft className="h-4 w-4" />Painel operacional</Link><Link href="/" className="flex items-center gap-2 text-sm font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1c4a3d] text-[#d7e981]"><Flame className="h-4 w-4" /></span>FireGuard</Link></div><div className="mb-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#a36931]">Conta e acesso</p><h1 className="mt-2 font-serif text-4xl">Meu perfil</h1><p className="mt-2 text-sm text-[#71877e]">Gerencie as informações associadas à sua conta FireGuard.</p></div><Card className="rounded-2xl border-[#dbe6d8] bg-[#fcfdf9] shadow-none"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-[#4b775f]" />Dados do perfil</CardTitle></CardHeader><CardContent className="space-y-5"><div><Label htmlFor="name">Nome de exibição</Label><Input id="name" className="mt-2 rounded-xl bg-white" value={name} onChange={event => setName(event.target.value)} placeholder="Como você quer ser identificado" /></div><div><Label>E-mail</Label><Input className="mt-2 rounded-xl bg-[#f4f7f1]" value={user.email ?? "Não informado pelo provedor"} disabled /></div><div className="rounded-xl border border-[#dfe9db] bg-[#f5f8f2] p-4"><p className="text-xs font-bold text-[#527449]">Papel de acesso: {user.role === "admin" ? "Admin" : user.role === "monitor" ? "Monitor" : "Usuário"}</p><p className="mt-1 text-xs leading-5 text-[#71877e]">O papel é definido pela administração da plataforma.</p></div><div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-between"><Button variant="outline" onClick={logout} className="rounded-xl">Sair da conta</Button><Button onClick={() => update.mutate({ name })} disabled={update.isPending || name.trim().length < 2} className="rounded-xl bg-[#1c4a3d] font-bold hover:bg-[#10332d]"><Save className="mr-2 h-4 w-4" />Salvar perfil</Button></div></CardContent></Card></div></main>;
}
