import Link from "next/link";

// ترويسة صفحة موحّدة: أيقونة + عنوان + وصف + زر رجوع.
export function PageHeader({
  title,
  subtitle,
  icon,
  backHref,
  backLabel = "رجوع",
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ghars-100 to-joy-100 text-xl shadow-card">
            {icon}
          </div>
        ) : null}
        <div>
          <h1 className="page-title leading-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-ghars-500">{subtitle}</p> : null}
        </div>
      </div>
      {backHref ? (
        <Link href={backHref} className="btn-ghost shrink-0 text-xs">
          {backLabel}
        </Link>
      ) : null}
    </div>
  );
}
