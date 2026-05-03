import { DocsLayout } from '../../components/DocsLayout'

export default function DocsLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>
}
