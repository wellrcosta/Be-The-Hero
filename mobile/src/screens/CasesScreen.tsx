import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';

import { apiFetch, clearSession } from '../lib/api';

type CaseItem = {
  id: string;
  title: string;
  value: string;
  status: 'OPEN' | 'CLOSED';
};

type Props = { onLoggedOut: () => void };

export function CasesScreen({ onLoggedOut }: Props) {
  const [items, setItems] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/cases?skip=0&take=20');
      if (!res.ok) {
        if (res.status === 401) {
          await clearSession();
          onLoggedOut();
          return;
        }
        throw new Error(`Failed (${res.status})`);
      }
      const data = (await res.json()) as { items: CaseItem[] };
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cases</Text>
        <Pressable
          onPress={async () => {
            await clearSession();
            onLoggedOut();
          }}
        >
          <Text style={styles.link}>Sair</Text>
        </Pressable>
      </View>

      {loading ? <Text>Carregando...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.status} • {item.value}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700' },
  link: { color: '#E02041', fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { fontWeight: '700' },
  cardMeta: { color: '#666', marginTop: 4 },
  error: { color: '#b00020', marginBottom: 8 },
});
