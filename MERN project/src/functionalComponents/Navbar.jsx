import Props from "./Props.jsx";

function Navbar(props) {
  return (
    <header>
      <nav>
        <h3>My Navbar</h3>
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
          <ol>
            <li>
              <Props grade="12" age="17" player="Haaland" />
            </li>
          </ol>
          <li>ReactLearn</li>
        </ul>
      </nav>
      <p>The above content is Navbar</p>
    </header>
  );
}

export default Navbar;
