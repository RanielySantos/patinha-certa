import {test,expect} from '@playwright/test';
test('descoberta, municípios e adoção demonstrativa persistente',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByText('18 histórias para conhecer')).toBeVisible();
 await expect(page.getByText('DEMONSTRAÇÃO',{exact:true})).toHaveCount(0);
 await expect(page.getByText('Ambiente demonstrativo · animais e responsáveis fictícios de Sergipe')).toHaveCount(0);
 for(const city of ['Aracaju','Areia Branca','Itabaiana']){
  await page.getByRole('button',{name:city,exact:true}).click();
  await expect(page.getByText('6 histórias para conhecer')).toBeVisible();
  await expect(page.getByText(`${city}, SE`,{exact:true})).toBeVisible();
  await page.getByRole('button',{name:city,exact:true}).click();
 }
 await page.screenshot({path:`test-results/${testInfo.project.name}-explorar.png`,fullPage:true});
 await page.getByRole('button',{name:'Favoritar animal'}).click();
 await page.getByRole('button',{name:'Experimentar demonstração'}).click();
 await page.getByRole('button',{name:'Favoritar animal'}).click();
 await page.getByRole('button',{name:'Conhecer Amora'}).click();
 await page.getByRole('button',{name:'Quero adotar Amora'}).click();
 await page.getByRole('textbox',{name:'Contato para retorno'}).fill('adotante@example.invalid');
 await page.getByRole('textbox',{name:'Por que você quer adotar?'}).fill('Tenho um lar preparado e tempo para cuidar com responsabilidade.');
 await page.getByRole('button',{name:'Confirmar pedido de adoção'}).click();
 const nav=page.getByRole(testInfo.project.name==='mobile'?'tab':'button',{name:'Pedidos',exact:true});
 // Navegação desktop usa Pressable; selecione pelo texto se não houver role explícito.
 if(await nav.count())await nav.click();else await page.getByText('Pedidos',{exact:true}).click();
 await expect(page.getByText('Pendente',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Cancelar pedido'}).click();
 await expect(page.getByText('Cancelado',{exact:true})).toBeVisible();
 await page.reload();
 await page.getByLabel('Abrir perfil').click();
 await page.getByRole('button',{name:'Experimentar demonstração'}).click();
 await page.getByText('Pedidos',{exact:true}).click();
 await expect(page.getByText('Cancelado',{exact:true})).toBeVisible();
 expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});
