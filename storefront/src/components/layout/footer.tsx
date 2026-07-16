import Link from 'next/link'
import { Instagram, Facebook, Mail } from 'lucide-react'

const footerLinks = {
  tienda: [
    { name: 'Todos los productos', href: '/productos' },
    { name: 'Tops', href: '/categorias/tops' },
    { name: 'Bottoms', href: '/categorias/bottoms' },
    { name: 'Nueva Colección', href: '/nueva-coleccion' },
  ],
  ayuda: [
    { name: 'Contacto', href: '/contacto' },
    { name: 'Envíos', href: '/envios' },
    { name: 'Devoluciones', href: '/devoluciones' },
    { name: 'Guía de Tallas', href: '/guia-tallas' },
  ],
  legal: [
    { name: 'Términos y condiciones', href: '/terminos' },
    { name: 'Política de privacidad', href: '/privacidad' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-brand-cream">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1">
              <span className="logo-main text-xl tracking-wide">LUNETTE</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Moda femenina con estilo único. Diseños exclusivos para mujeres que quieren destacar.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-gray-500 hover:text-brand-red">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-red">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-red">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 font-semibold text-brand-red">Tienda</h3>
            <ul className="space-y-2">
              {footerLinks.tienda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-brand-red"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-brand-red">Ayuda</h3>
            <ul className="space-y-2">
              {footerLinks.ayuda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-brand-red"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-brand-red">Newsletter</h3>
            <p className="text-sm text-gray-600">
              Suscríbete para recibir novedades y ofertas exclusivas.
            </p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-brand-red px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-dark"
              >
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Lunette. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
