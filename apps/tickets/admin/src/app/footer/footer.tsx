import styles from './footer.module.scss';

/* eslint-disable-next-line */
export interface FooterProps {}

export function Footer(props: FooterProps) {
  return (
    <footer className="footer">
      <div className="content has-text-centered">
        <p>
          <strong>Graph Commerce</strong> by <a href="https://joseantcordeiro.hopto.org/"> José Cordeiro</a>. The source code is licensed
          <a href="https://www.gnu.org/licenses/gpl-3.0.html"> GNU General Public License, version 3 (GPLv3)</a>.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
