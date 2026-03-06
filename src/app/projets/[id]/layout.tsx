import { ReactNode } from 'react';

export async function generateStaticParams() {
    try {
        const res = await fetch('https://www.berthonipassoportfolio.com/api/projects/', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const projects = await res.json();
        return projects.map((p: any) => ({
            id: p.id.toString(),
        }));
    } catch (err) {
        console.warn("API indisponible pendant le build, fallback sur l'ID de base");
        return [{ id: '41' }];
    }
}
export default function ProjectLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
