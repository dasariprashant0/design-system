import type {ReactNode} from 'react';

export const Section = ({title, children}: {title: string; children: ReactNode}) => (
  <section className="block"><h2 className="label">{title}</h2>{children}</section>
);
export const P = ({children}: {children: ReactNode}) => <p className="prose">{children}</p>;
