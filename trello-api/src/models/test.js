function testVar() {
  const i = 2;
  if (i > 1) {
    var x = 10;
  }
  console.log(x); // ✅ 10 (vì var có function scope)
}
