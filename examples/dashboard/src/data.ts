export type Status = 'paid' | 'pending' | 'refunded';
export interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: Status;
  date: Date;
}

const names = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Pauling', 'Katherine Johnson', 'Margaret Hamilton', 'Dennis Ritchie', 'Barbara Liskov', 'Donald Knuth', 'Edsger Dijkstra', 'Radia Perlman', 'Tim Berners-Lee'];
const statuses: Status[] = ['paid', 'paid', 'paid', 'pending', 'refunded'];

export const orders: Order[] = Array.from({length: 48}, (_, i) => {
  const customer = names[i % names.length]!;
  return {
    id: `ORD-${1000 + i}`,
    customer,
    email: `${customer.split(' ')[0]!.toLowerCase()}@example.com`,
    amount: 40 + ((i * 53) % 410),
    status: statuses[i % statuses.length]!,
    date: new Date(2026, 9, 31 - Math.floor(i * 1.9)),
  };
});

export const money = (n: number) => n.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0});
